import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { motion } from "framer-motion";
import { getImageSrc } from "../lib/utils";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const { login, isLoggingIn, getAllUsers } = useAuthStore();
    const [quickUsers, setQuickUsers] = useState([]);

    useEffect(() => {
        const loadUsers = async () => {
            const users = await getAllUsers();
            setQuickUsers(users);
        };
        loadUsers();
    }, [getAllUsers]);

    const handleQuickLogin = (user) => {
        login({ email: user.email, password: "Surya@123" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        login(formData);
    };

    return (
        <div className="h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto"
            >
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div
                                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-all duration-300 shadow-lg group-hover:shadow-primary/30"
                            >
                                <MessageSquare className="size-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                            <p className="text-base-content/60">Sign in to your account</p>
                        </motion.div>
                    </div>

                    {/* Quick Login Section */}
                    {quickUsers.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-base-content/70 mb-4 text-center">Quick Login (Surya@123)</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {quickUsers.map(user => (
                                    <button
                                        key={user._id}
                                        onClick={() => handleQuickLogin(user)}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-base-200 transition-colors border border-base-200"
                                        disabled={isLoggingIn}
                                    >
                                        <div className="size-12 rounded-full overflow-hidden border">
                                            <img
                                                src={getImageSrc(user.profilePic)}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-xs font-medium truncate w-full text-center">{user.fullName}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="divider my-6">OR</div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Email</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="size-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    className={`input input-bordered w-full pl-10 transition-all focus:ring-2 focus:ring-primary/50`}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Password</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="size-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`input input-bordered w-full pl-10 transition-all focus:ring-2 focus:ring-primary/50`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-5 text-base-content/40" />
                                    ) : (
                                        <Eye className="size-5 text-base-content/40" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full shadow-lg hover:shadow-primary/40 transition-shadow"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-base-content/60">
                            Don&apos;t have an account?{" "}
                            <Link to="/signup" className="link link-primary hover:underline transition-all">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Image/Pattern */}
            <AuthImagePattern
                title={"Welcome back!"}
                subtitle={"Sign in to continue your conversations and catch up with your messages."}
            />
        </div>
    );
};
export default LoginPage;
