import { useEffect, useState, useRef } from "react";
import { PhoneOff, Mic, MicOff, Volume2, Video, VideoOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { getImageSrc } from "../lib/utils";

const ActiveCallInterface = () => {

    const {
        callStatus,
        callType,
        caller,
        remoteStream,
        localStream,
        callDuration,
        resetCall,
    } = useCallStore();
    const { socket } = useAuthStore();

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);

    useEffect(() => {
        if (callType === "video" && localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callType]);

    useEffect(() => {
        if (callType === "video" && remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callType]);

    // Connect remote audio stream for voice calls
    useEffect(() => {
        console.log("Audio useEffect triggered:", { callType, hasRemoteStream: !!remoteStream, hasAudioRef: !!remoteAudioRef.current });

        if (callType === "audio" && remoteStream) {
            console.log("Remote stream audio tracks:", remoteStream.getAudioTracks());

            if (remoteAudioRef.current) {
                console.log("Connecting remote audio stream to audio element");
                remoteAudioRef.current.srcObject = remoteStream;
                remoteAudioRef.current.play().catch(err => {
                    console.log("Could not autoplay remote audio:", err);
                });
            } else {
                console.log("Audio ref not yet available, will retry on next render");
            }
        }
    }, [remoteStream, callType]);

    // Dialing tone reference
    const dialingToneRef = useRef(null);

    // Play dialing tone for outgoing calls
    useEffect(() => {
        if (callStatus === "outgoing") {
            const audio = new Audio("/callliftre.mp3");
            audio.loop = true;
            audio.volume = 0.5;
            dialingToneRef.current = audio;

            audio.play().catch(err => {
                console.log("Could not play dialing tone:", err);
            });

            return () => {
                if (dialingToneRef.current) {
                    dialingToneRef.current.pause();
                    dialingToneRef.current.currentTime = 0;
                    dialingToneRef.current = null;
                }
            };
        }
    }, [callStatus]);


    const handleEndCall = () => {
        if (caller?._id) {
            socket.emit("endCall", { to: caller._id });
        }
        resetCall();
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(!isCameraOn);
            } else {
                // Future proofing: If we wanted to add video mid-call, we'd need to getUserMedia and addTrack here
                // But for now, we just assume video track exists if callType is video
            }
        }
    };

    const toggleSpeaker = async () => {
        setIsSpeakerOn(!isSpeakerOn);
    };

    if (callStatus !== "connected" && callStatus !== "outgoing") return null;

    // Robust check: It's a video call if the store says so OR if we detect a video track in the remote stream
    const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().length > 0;
    const isVideoCall = callType === "video" || hasRemoteVideo;

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-between overflow-hidden">

            {/* VIDEO LAYOUT */}
            {isVideoCall ? (
                <>
                    {/* Remote Video (Full Screen) */}
                    <div className="absolute inset-0 z-0">
                        {remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <span className="loading loading-spinner loading-lg text-primary"></span>
                            </div>
                        )}
                    </div>

                    {/* Local Video (PiP) */}
                    <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-xl border-2 border-white/20 shadow-2xl overflow-hidden z-20">
                        {localStream && (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror"
                                style={{ transform: "scaleX(-1)" }}
                            />
                        )}
                        {!isCameraOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <VideoOff className="text-white/50" />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* AUDIO LAYOUT (Existing) */
                <>
                    {/* Background Blur Image */}
                    {caller?.profilePic && (
                        <div
                            className="absolute inset-0 opacity-20 blur-3xl bg-center bg-cover"
                            style={{ backgroundImage: `url(${getImageSrc(caller.profilePic)})` }}
                        />
                    )}

                    {/* Main Visual / Avatar */}
                    <div className="flex-1 flex items-center justify-center z-10 w-full my-8 mt-32">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping blur-2xl animation-duration-3000"></div>

                            <div className="size-48 rounded-full border-4 border-white/10 shadow-2xl overflow-hidden relative glass-effect">
                                <img src={getImageSrc(caller?.profilePic)} alt={caller?.fullName} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Top Info Overlay */}
            <div className={`flex flex-col items-center gap-2 mt-12 z-10 w-full relative ${isVideoCall ? "bg-gradient-to-b from-black/60 to-transparent pt-4 pb-12" : ""}`}>
                {callStatus === "connected" ? (
                    <div className="glass-effect-light px-4 py-1 rounded-full border border-white/10 backdrop-blur-md">
                        <span className="text-emerald-400 text-sm font-mono tracking-widest font-bold">
                            {new Date(callDuration * 1000).toISOString().substr(11, 8)}
                        </span>
                    </div>
                ) : (
                    <p className="text-white/80 uppercase tracking-widest text-sm animate-pulse font-medium">
                        {callStatus === "outgoing" ? "Calling..." : "Ringing..."}
                    </p>
                )}

                <h2 className="text-3xl font-bold text-white text-center drop-shadow-md">{caller?.fullName}</h2>
            </div>

            {/* Hidden Audio Element for Remote Stream (Audio Call) */}
            {callType === "audio" && (
                <audio
                    ref={remoteAudioRef}
                    autoPlay
                    playsInline
                    style={{ display: 'none' }}
                />
            )}


            {/* Call Controls Box */}
            <div className={`w-full max-w-sm z-30 mb-8 p-6 ${isVideoCall ? "" : "bg-white/10 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl"}`}>
                <div className="grid grid-cols-3 gap-6 place-items-center">

                    {/* Speaker */}
                    <button
                        onClick={toggleSpeaker}
                        className={`btn btn-circle btn-lg border-0 transition-all ${isSpeakerOn ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
                    >
                        <Volume2 size={28} />
                    </button>

                    {/* Mute */}
                    <button
                        onClick={toggleMute}
                        className={`btn btn-circle btn-lg border-0 transition-all ${isMuted ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
                    >
                        {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>

                    {/* Video Toggle (Only for Video Calls or to Upgrade?) 
                        For now, only enable if isVideoCall. 
                        To upgrade audio to video later is complex (negotiation needed).
                    */}
                    <button
                        onClick={toggleCamera}
                        className={`btn btn-circle btn-lg border-0 transition-all ${!isCameraOn ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
                        disabled={!isVideoCall}
                    >
                        {/* If not video call, show disabled state */}
                        {!isCameraOn ? <VideoOff size={28} /> : <Video size={28} />}
                    </button>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleEndCall}
                        className="btn btn-error btn-circle w-20 h-20 text-white shadow-lg transform hover:scale-105 transition-all border-4 border-red-500/30"
                    >
                        <PhoneOff size={32} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveCallInterface;
