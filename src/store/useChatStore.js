import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isTyping: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    markAsRead: async (senderId) => {
        try {
            await axiosInstance.put(`/messages/read/${senderId}`);
        } catch (error) {
            console.error("Failed to mark messages as read", error);
        }
    },

    clearChat: async () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        try {
            await axiosInstance.delete(`/messages/delete/${selectedUser._id}`);
            set({ messages: [] });
            toast.success("Chat cleared successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to clear chat");
        }
    },

    subscribeToSocketEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const { selectedUser, messages, users } = get();
            const myId = useAuthStore.getState().authUser._id;

            console.log("Socket: newMessage received", newMessage);

            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser?._id;
            const isMessageSentByMe = newMessage.senderId === myId;

            console.log("Socket: match status", { isMessageSentFromSelectedUser, isMessageSentByMe, selectedUserId: selectedUser?._id });

            // Check for duplicate message first - prevent processing the same message twice
            // This can happen when sender receives their own message via socket (multi-device sync)
            const isAlreadyInMessages = messages.some(msg => msg._id === newMessage._id);

            // Find the other user in this conversation
            const otherUserId = isMessageSentByMe ? newMessage.receiverId : newMessage.senderId;
            const otherUser = users.find(u => u._id === otherUserId);

            // Check if this message was already processed for sidebar (same lastMessage ID)
            const isAlreadyLastMessage = otherUser?.lastMessage?._id === newMessage._id;

            // Only update sidebar if this is a new message we haven't processed
            if (!isAlreadyLastMessage) {
                const updatedUsers = users.map(user => {
                    if (user._id === otherUserId) {
                        // Only increment unread if:
                        // 1. It's not from me (I sent it)
                        // 2. I'm not currently chatting with the sender
                        // 3. This is not a duplicate
                        const shouldIncrementUnread = !isMessageSentByMe &&
                            selectedUser?._id !== newMessage.senderId &&
                            !isAlreadyInMessages;

                        return {
                            ...user,
                            lastMessage: {
                                _id: newMessage._id,
                                text: newMessage.text,
                                image: newMessage.image,
                                senderId: newMessage.senderId,
                                createdAt: newMessage.createdAt,
                            },
                            unreadCount: shouldIncrementUnread
                                ? (user.unreadCount || 0) + 1
                                : user.unreadCount || 0,
                        };
                    }
                    return user;
                });

                // Sort users by last message time (move the updated user to top)
                updatedUsers.sort((a, b) => {
                    const aTime = a.lastMessage?.createdAt || 0;
                    const bTime = b.lastMessage?.createdAt || 0;
                    return new Date(bTime) - new Date(aTime);
                });

                set({ users: updatedUsers });
            }

            // Scenario 1: I am chatting with the sender (or I sent it myself and want to see it)
            if (isMessageSentFromSelectedUser || isMessageSentByMe) {
                // Check if we already have this message (prevent duplicates from self-sync)
                if (messages.some(msg => msg._id === newMessage._id)) return;

                set({
                    messages: [...messages, newMessage],
                });

                // If it's incoming (not from me), emit Delivered status instantly
                if (isMessageSentFromSelectedUser) {
                    socket.emit("messageDelivered", { messageId: newMessage._id, senderId: newMessage.senderId });
                }

                // If window is hidden, still notify
                if (document.hidden && !isMessageSentByMe) {
                    const sender = users.find(u => u._id === newMessage.senderId);
                    const senderName = sender ? sender.fullName : "Surya";
                    toast.success(`New message from ${senderName}`);
                    try { new Audio("/notification.wav").play(); } catch (e) { }
                }

            } else {
                // Scenario 2: I am NOT chatting with the sender. NOTIFY!
                if (!isMessageSentByMe) {
                    const sender = users.find(u => u._id === newMessage.senderId);
                    const senderName = sender ? sender.fullName : "Chatter";
                    toast.success(`New message from ${senderName}`);
                    try { new Audio("/notification.wav").play(); } catch (e) { }
                }
            }
        });

        socket.on("messageDelivered", ({ messageId }) => {
            set(state => ({
                messages: state.messages.map(msg =>
                    msg._id === messageId ? { ...msg, status: "delivered" } : msg
                )
            }));
        });

        // Listen for when MY messages are read by the other person
        socket.on("messagesRead", ({ by }) => {
            const { selectedUser } = get();
            if (selectedUser && by === selectedUser._id) {
                set(state => ({
                    messages: state.messages.map(msg =>
                        msg.senderId !== by ? { ...msg, status: "read" } : msg
                    )
                }));
            }
        });

        socket.on("typing", ({ senderId }) => {
            const { selectedUser } = get();
            if (selectedUser && senderId === selectedUser._id) {
                set({ isTyping: true });
            }
        });

        socket.on("stopTyping", ({ senderId }) => {
            const { selectedUser } = get();
            if (selectedUser && senderId === selectedUser._id) {
                set({ isTyping: false });
            }
        });
    },

    unsubscribeFromSocketEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messageDelivered");
        socket.off("messagesRead");
        socket.off("typing");
        socket.off("stopTyping");
    },

    setSelectedUser: (selectedUser) => {
        // Clear unread count for the selected user
        if (selectedUser) {
            const { users } = get();
            const updatedUsers = users.map(user =>
                user._id === selectedUser._id
                    ? { ...user, unreadCount: 0 }
                    : user
            );
            set({ selectedUser, users: updatedUsers });
        } else {
            set({ selectedUser });
        }
    },
}));
