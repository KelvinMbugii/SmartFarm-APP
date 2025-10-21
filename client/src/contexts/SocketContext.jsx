import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SERVER_URL = import.meta.env.VITE_API_BASE_URL;
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect when user & token are available
    if (!user || !token) return;

    console.log("Connecting to socket server:", SERVER_URL);

    //  Configure socket with better reliability
    const s = io(SERVER_URL, {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      timeout: 10000, // Wait 10s before failing
    });

    // --- Socket event handlers ---
    s.on("connect", () => {
      setConnected(true);
      console.log("Socket connected:", s.id);

      if (user?._id) {
        s.emit("join-user", user._id);
        console.log("Joined user room:", user._id);
      }
    });

    s.on("disconnect", (reason) => {
      setConnected(false);
      console.warn(" Socket disconnected:", reason);
    });

    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    s.io.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnect attempt #${attempt}`);
    });

    // --- Save and cleanup ---
    setSocket(s);

    return () => {
      console.log("🧹 Cleaning up socket...");
      s.disconnect();
      setConnected(false);
      setSocket(null);
    };
  }, [user, token]); // Reconnect if user/token changes

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
export default SocketContext;