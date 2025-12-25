import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import IncomingCallModal from "./components/IncomingCallModal";
import ActiveCallInterface from "./components/ActiveCallInterface";

import { useThemeStore } from "./store/useThemeStore";
import { useCallStore } from "./store/useCallStore"; // Added
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { subscribeToSocketEvents, unsubscribeFromSocketEvents } = useChatStore();
  const { theme } = useThemeStore();
  const {
    setCallStatus,
    setCaller,
    setCallerSignal,
    resetCall,
    setCallType
  } = useCallStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Subscribe to chat socket events (newMessage, typing, etc.)
  useEffect(() => {
    if (!socket) return;

    subscribeToSocketEvents();

    return () => {
      unsubscribeFromSocketEvents();
    };
  }, [socket, subscribeToSocketEvents, unsubscribeFromSocketEvents]);

  // Global Call Listener
  useEffect(() => {
    if (!socket) return;

    socket.on("callUser", ({ from, name: callerName, signal, profilePic, callType }) => {
      console.log("Receiving call from", callerName);
      setCaller({ _id: from, fullName: callerName, profilePic });
      setCallerSignal(signal);
      setCallStatus("incoming");
      setCallType(callType || "audio");
    });

    socket.on("callRejected", () => {
      resetCall();
      // We can show toast here
    });

    socket.on("callEnded", () => {
      resetCall();
    });

    return () => {
      socket.off("callUser");
      socket.off("callRejected");
      socket.off("callEnded");
    }
  }, [socket, setCallStatus, setCaller, setCallerSignal, resetCall]);

  console.log("online users: ", onlineUsers);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* Global Call Components */}
      {authUser && (
        <>
          <IncomingCallModal />
          <ActiveCallInterface />
        </>
      )}

      <Toaster />
    </div>
  );
};

export default App;