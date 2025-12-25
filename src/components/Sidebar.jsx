import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageSrc, formatMessageTime } from "../lib/utils";

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = showOnlineOnly
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users;

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5 backdrop-blur-lg bg-base-100/80 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Users className="size-6 text-primary" />
                    <span className="font-semibold hidden lg:block text-lg">Contacts</span>
                </div>
                {/* Todo: Online filter toggle */}
                <div className="mt-3 hidden lg:flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2 group">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm checkbox-primary"
                        />
                        <span className="text-sm group-hover:text-primary transition-colors">Show online only</span>
                    </label>
                    <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
                </div>
            </div>

            <div className="overflow-y-auto w-full py-3 custom-scrollbar">
                <AnimatePresence>
                    {filteredUsers.map((user, idx) => (
                        <motion.button
                            key={user._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedUser(user)}
                            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-primary/5 transition-all duration-200
              ${selectedUser?._id === user._id ? "bg-primary/10 border-l-4 border-primary" : "border-l-4 border-transparent"}
              ${user.unreadCount > 0 ? "bg-primary/5" : ""}
            `}
                        >
                            <div className="relative mx-auto lg:mx-0 flex-shrink-0">
                                <img
                                    src={getImageSrc(user.profilePic)}
                                    alt={user.fullName}
                                    className="size-12 object-cover rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                                />
                                {onlineUsers.includes(user._id) && (
                                    <span
                                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-base-100 animate-pulse"
                                    />
                                )}
                            </div>

                            <div className="hidden lg:flex flex-col text-left min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`font-medium truncate ${user.unreadCount > 0 ? "text-base-content" : "text-base-content/90"}`}>
                                        {user.fullName}
                                    </span>
                                    {user.lastMessage && (
                                        <span className="text-xs text-zinc-500 flex-shrink-0">
                                            {formatMessageTime(user.lastMessage.createdAt)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`text-sm truncate ${user.unreadCount > 0 ? "text-base-content font-medium" : "text-zinc-400"}`}>
                                        {user.lastMessage ? (
                                            user.lastMessage.image ? (
                                                <span className="flex items-center gap-1">
                                                    <Image size={14} /> Photo
                                                </span>
                                            ) : (
                                                user.lastMessage.text?.substring(0, 30) + (user.lastMessage.text?.length > 30 ? "..." : "")
                                            )
                                        ) : (
                                            onlineUsers.includes(user._id) ? "Online" : "Offline"
                                        )}
                                    </span>
                                    {user.unreadCount > 0 && (
                                        <span className="bg-primary text-primary-content text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                                            {user.unreadCount > 99 ? "99+" : user.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {filteredUsers.length === 0 && (
                    <div className="text-center text-zinc-500 py-4 italic">No online users</div>
                )}
            </div>
        </aside>
    );
};
export default Sidebar;
