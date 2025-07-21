// import React, { createContext, useContext, useEffect, useState } from "react";
// import io from "socket.io-client";
// import { useAuth } from "./AuthContext";

// const SERVER_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// const SocketContext = createContext(undefined);

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context)
//     throw new Error("useSocket must be used within a SocketProvider");
//   return context;
// };

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const { user, token } = useAuth();

//   useEffect(() => {
//     let newSocket;

//     if (user && token) {
//       newSocket = io(SERVER_URL, {
//         auth: { token },
//       });

//       newSocket.on("connect", () => {
//         setIsConnected(true);
//         if (user._id) {
//           newSocket.emit("join-user", user._id);
//         }
//       });

//       newSocket.on("disconnect", () => setIsConnected(false));

//       newSocket.on("connect_error", (err) => {
//         console.error("Socket connect error:", err.message);
//         // Optional: handle unauthorized & force logout if needed
//       });

//       setSocket(newSocket);
//     }

//     return () => {
//       if (newSocket) {
//         newSocket.disconnect();
//       }
//       setIsConnected(false);
//       setSocket(null);
//     };
//   }, [user, token]);

//   return (
//     <SocketContext.Provider value={{ socket, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };


import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SERVER_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      const s = io(SERVER_URL, {
        auth: { token },
        transports: ["polling", "websocket"],
      });

      s.on("connect", () => {
        setConnected(true);
        s.emit("join-user", user.id); // Example custom event
      });

      s.on("disconnect", () => setConnected(false));
      s.on("connect_error", (err) =>
        console.error("Socket connect error:", err.message)
      );

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
