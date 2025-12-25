import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, getImageSrc } from "../lib/utils";
import { Check, CheckCheck } from "lucide-react";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        markAsRead,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id);
        markAsRead(selectedUser._id);
    }, [selectedUser._id, getMessages, markAsRead]);

    // Additional effect: When new messages arrive via socket while we are viewing this chat, mark them as read
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.senderId === selectedUser._id && lastMessage.status !== "read") {
                markAsRead(selectedUser._id);
            }
        }
    }, [messages, selectedUser._id, markAsRead]);


    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                        ref={messageEndRef}
                    >
                        <div className=" chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser._id
                                            ? getImageSrc(authUser.profilePic)
                                            : getImageSrc(selectedUser.profilePic)
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>
                        <div className="chat-bubble flex flex-col relative group">
                            {message.image && (
                                <img
                                    src={getImageSrc(message.image)}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p className="pr-4">{message.text}</p>}

                            {/* Tick Marks for User's Own Messages */}
                            {message.senderId === authUser._id && (
                                <span className="self-end mt-1">
                                    {message.status === "read" ? (
                                        <CheckCheck size={16} className="text-blue-500" />
                                    ) : message.status === "delivered" ? (
                                        <CheckCheck size={16} className="text-current opacity-70" />
                                    ) : (
                                        <Check size={16} className="text-current opacity-70" />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <MessageInput />
        </div>
    );
};
export default ChatContainer;
