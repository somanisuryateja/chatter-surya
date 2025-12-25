import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import Peer from "simple-peer";
import toast from "react-hot-toast";
import { getImageSrc } from "../lib/utils";

const IncomingCallModal = () => {
    const {
        callStatus,
        caller,
        callerSignal,
        setCallStatus,
        setPeer,
        setRemoteStream,
        setLocalStream,
        startCallDurationTimer,
        resetCall,
        callType
    } = useCallStore();
    const { socket } = useAuthStore();

    // Ringtone audio reference
    const ringtoneRef = useRef(null);

    // Play ringtone when incoming call
    useEffect(() => {
        if (callStatus === "incoming") {
            // Create audio element for ringtone
            const audio = new Audio("/calllifterringtone.mp3");
            audio.loop = true;
            audio.volume = 0.7;
            ringtoneRef.current = audio;

            // Try to play (may fail due to browser autoplay policies)
            audio.play().catch(err => {
                console.log("Could not autoplay ringtone:", err);
            });

            return () => {
                // Stop ringtone when component unmounts or call status changes
                if (ringtoneRef.current) {
                    ringtoneRef.current.pause();
                    ringtoneRef.current.currentTime = 0;
                    ringtoneRef.current = null;
                }
            };
        }
    }, [callStatus]);

    const handleAcceptCall = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("getUserMedia not supported. Ensure HTTPS.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: callType === "video",
                audio: true
            });

            setLocalStream(stream);
            setCallStatus("connected");

            const peer = new Peer({
                initiator: false,
                trickle: true,  // Enable trickle ICE for faster connection
                stream: stream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                        { urls: 'stun:stun4.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });

            let hasAnswered = false;
            peer.on("signal", (signal) => {
                if (signal.type === 'answer') {
                    console.log("Receiver: sending answer");
                    hasAnswered = true;
                    socket.emit("answerCall", { signal, to: caller._id });
                } else if (signal.candidate && hasAnswered) {
                    // Send ICE candidate
                    console.log("Receiver: sending ICE candidate");
                    socket.emit("iceCandidate", {
                        to: caller._id,
                        candidate: signal
                    });
                }
            });

            peer.on("stream", (remoteStream) => {
                console.log("Receiver: received remote stream", remoteStream.getTracks());
                setRemoteStream(remoteStream);
            });

            peer.on("connect", () => {
                console.log("Receiver: peer connected!");
            });

            peer.on("close", () => {
                resetCall();
                toast.success("Call ended");
            });

            peer.on("error", (err) => {
                console.error("Receiver: Peer error", err);
                resetCall();
                toast.error("Call connection error: " + err.message);
            });

            // Handle incoming ICE candidates from caller
            const handleIceCandidate = (candidate) => {
                console.log("Receiver: received ICE candidate from caller");
                try {
                    peer.signal(candidate);
                } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                }
            };
            socket.on("iceCandidate", handleIceCandidate);

            peer.signal(callerSignal);
            setPeer(peer);
            startCallDurationTimer();

        } catch (error) {
            console.error("Error accessing media devices", error);
            toast.error(`Media access error: ${error.name}: ${error.message}`);
            resetCall();
        }
    };

    const handleRejectCall = () => {
        socket.emit("rejectCall", { to: caller._id });
        resetCall();
    };

    if (callStatus !== "incoming") return null;

    const isVideo = callType === "video";

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-between py-16 px-4 animate-in fade-in duration-300">

            {/* Caller Info */}
            <div className="flex flex-col items-center gap-6 mt-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping blur-xl"></div>
                    <div className="size-32 rounded-full border-4 border-base-100 shadow-2xl relative z-10 overflow-hidden">
                        <img
                            src={getImageSrc(caller?.profilePic)}
                            alt="caller"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="text-center space-y-2 z-10">
                    <h3 className="text-3xl font-bold text-white tracking-wide">{caller?.fullName}</h3>
                    <p className="text-white/70 text-lg animate-pulse">
                        {isVideo ? "Incoming Video Call..." : "Incoming Voice Call..."}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-16 mb-8 z-10">
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleRejectCall}
                        className="btn btn-error btn-circle w-20 h-20 text-white shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-red-500/30"
                    >
                        <PhoneOff size={36} />
                    </button>
                    <span className="text-white/80 text-sm font-medium">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleAcceptCall}
                        className="btn btn-success btn-circle w-20 h-20 text-white shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce border-4 border-emerald-500/30"
                    >
                        {isVideo ? <Video size={36} /> : <Phone size={36} />}
                    </button>
                    <span className="text-white/80 text-sm font-medium">Accept</span>
                </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/60 to-transparent -z-10" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent -z-10" />
        </div>
    );
};

export default IncomingCallModal;
