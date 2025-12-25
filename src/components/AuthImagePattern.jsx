import { motion } from "framer-motion";

const AuthImagePattern = ({ title, subtitle }) => {
    return (
        <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-secondary/20 opacity-50" />

            <div className="max-w-md text-center relative z-10">
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[...Array(9)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatType: "reverse",
                                repeatDelay: 2
                            }}
                            className={`aspect-square rounded-2xl bg-primary/10 ${i % 2 === 0 ? "animate-pulse" : ""
                                }`}
                        />
                    ))}
                </div>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                >
                    {title}
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-base-content/60 text-lg"
                >
                    {subtitle}
                </motion.p>
            </div>
        </div>
    );
};

export default AuthImagePattern;
