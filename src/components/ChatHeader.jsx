import { useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore"; // Added
import { Phone, PhoneOff, Video, MoreVertical, X, Trash2 } from "lucide-react"; // Added Phone
import toast from "react-hot-toast";
import Peer from "simple-peer";
import { getImageSrc } from "../lib/utils";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser, isTyping, clearChat } = useChatStore();
    const { onlineUsers, socket, authUser } = useAuthStore();
    const {
        setCallStatus,
        setCallType,
        setLocalStream,
        setPeer,
        setRemoteStream,
        startCallDurationTimer,
        setCaller,
        resetCall
    } = useCallStore();

    const handleStartCall = async (isVideo = false) => {
        if (!onlineUsers.includes(selectedUser._id)) {
            toast.error("User is offline. Cannot call.");
            return;
        }

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("getUserMedia is not supported. Ensure HTTPS.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: isVideo ? true : false,
                audio: true
            });

            setLocalStream(stream);
            setCallStatus("outgoing");
            setCallType(isVideo ? "video" : "audio");
            setCaller(selectedUser); // For UI display

            const peer = new Peer({
                initiator: true, // We are starting the call
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

            let hasOffered = false;
            peer.on("signal", (data) => {
                if (data.type === 'offer') {
                    console.log("Caller: sending offer");
                    hasOffered = true;
                    socket.emit("callUser", {
                        userToCall: selectedUser._id,
                        signalData: data,
                        from: authUser._id,
                        name: authUser.fullName,
                        profilePic: authUser.profilePic,
                        callType: isVideo ? "video" : "audio"
                    });
                } else if (data.candidate && hasOffered) {
                    // Send ICE candidate
                    console.log("Caller: sending ICE candidate");
                    socket.emit("iceCandidate", {
                        to: selectedUser._id,
                        candidate: data
                    });
                }
            });

            peer.on("stream", (remoteStream) => {
                console.log("Caller: received remote stream", remoteStream.getTracks());
                setRemoteStream(remoteStream);
            });

            peer.on("connect", () => {
                console.log("Caller: peer connected!");
            });

            peer.on("close", () => {
                resetCall();
            });

            peer.on("error", (err) => {
                console.error("Peer error (caller):", err);
                toast.error("Call connection error: " + err.message);
                resetCall();
            });

            // Handle call accepted
            const handleCallAccepted = (signal) => {
                console.log("Caller: call accepted, signaling answer");
                setCallStatus("connected");
                peer.signal(signal);
                startCallDurationTimer();
            };
            socket.on("callAccepted", handleCallAccepted);

            // Handle incoming ICE candidates from receiver
            const handleIceCandidate = (candidate) => {
                console.log("Caller: received ICE candidate from receiver");
                try {
                    peer.signal(candidate);
                } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                }
            };
            socket.on("iceCandidate", handleIceCandidate);

            setPeer(peer);

        } catch (err) {
            console.error("Failed to start call", err);
            toast.error(`Call failed: ${err.name}: ${err.message}`);
            resetCall();
        }
    };

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            <img src={getImageSrc(selectedUser.profilePic)} alt={selectedUser.fullName} />
                        </div>
                    </div>

                    {/* User info */}
                    <div>
                        <h3 className="font-medium">{selectedUser.fullName}</h3>
                        <p className="text-sm text-base-content/70">
                            {isTyping ? (
                                <span className="text-primary italic animate-pulse">Typing...</span>
                            ) : (
                                onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
                            )}
                        </p>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleStartCall(false)}
                        className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-primary hover:bg-base-200"
                        title="Voice Call"
                    >
                        <Phone size={20} />
                    </button>
                    <button
                        onClick={() => handleStartCall(true)}
                        className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-primary hover:bg-base-200"
                        title="Video Call"
                    >
                        <Video size={20} />
                    </button>

                    <button
                        key="clear-chat-btn"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear this chat history?")) {
                                clearChat();
                            }
                        }}
                        className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-error hover:bg-base-200"
                        title="Clear Chat"
                    >
                        <Trash2 size={20} />
                    </button>

                    <button onClick={() => setSelectedUser(null)} className="btn btn-sm btn-circle btn-ghost text-base-content/70">
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ChatHeader;
