import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

// Always use VITE_ prefix environment variable in Vite projects!
const SERVER_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SocketContext = createContext(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const { user, token } = useAuth();

  useEffect(() => {
    let newSocket = null;
    if (user && token) {
      newSocket = io(SERVER_URL, {
        auth: { token },
        
      });

      newSocket.on("connect", () => {
        setIsConnected(true);
        if (user && user.id) {
          newSocket.emit("join-user", user.id);
        }
      });

      newSocket.on("disconnect", () => setIsConnected(false));

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Cleanup on logout
      setIsConnected(false);
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
