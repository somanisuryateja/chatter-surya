import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage, selectedUser } = useChatStore();
    const { socket } = useAuthStore();

    // Typing timeout ref
    const typingTimeoutRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiClick = (emojiObject) => {
        setText((prev) => prev + emojiObject.emoji);
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!text.trim() && !imagePreview) return;

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            // Clear form
            setText("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setShowEmojiPicker(false);

            // Stop typing immediately
            socket.emit("stopTyping", { receiverId: selectedUser._id });

        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleTyping = (e) => {
        setText(e.target.value);

        if (!socket) return;

        socket.emit("typing", { receiverId: selectedUser._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { receiverId: selectedUser._id });
        }, 2000);
    };

    return (
        <div className="p-4 w-full relative">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-40 shadow-xl rounded-xl">
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2 relative">
                    <button
                        type="button"
                        className="hidden sm:flex btn btn-circle text-zinc-400 hover:text-emerald-500"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <Smile size={20} />
                    </button>

                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={handleTyping}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && !imagePreview}
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};
export default MessageInput;
