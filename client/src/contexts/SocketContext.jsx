import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SERVER_URL = import.meta.env.VITE_API_BASE_URL;

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      const s = io(SERVER_URL, {
        auth: { token }, 
        transports: ["websocket"], 
        withCredentials: true, 
      });

      s.on("connect", () => {
        setConnected(true);
        console.log("Socket connected:", s.id);
        s.emit("join-user", user._id); 
      });

      s.on("disconnect", () => {
        setConnected(false);
        console.log("Socket disconnected");
      });

      s.on("connect_error", (err) => {
        console.error("Socket connect error:", err.message);
      });

      setSocket(s);

      return () => {
        s.disconnect();
        setConnected(false);
        setSocket(null);
      };
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
