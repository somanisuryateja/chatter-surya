import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const NoChatSelected = () => {
    return (
        <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50 backdrop-blur-sm">
            <div className="max-w-md text-center space-y-6">
                {/* Icon Display */}
                <div className="flex justify-center gap-4 mb-4">
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20
                            }}
                            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center"
                        >
                            <MessageSquare className="w-8 h-8 text-primary animate-pulse" />
                        </motion.div>
                    </div>
                </div>

                {/* Welcome Text */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome to Chatter!.</h2>
                    <p className="text-base-content/60 mt-2">
                        Select a conversation from the sidebar to start chatting
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default NoChatSelected;
