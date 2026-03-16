// import React, { useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import { useAuth } from "../contexts/AuthContext";
// import { useSocket } from "../contexts/SocketContext";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { MessageCircle, Send, Search, Paperclip } from "lucide-react";
// import {
//   decryptMessage,
//   encryptFileBytes,
//   encryptPayloadForParticipants,
//   exportHelpers,
//   getStoredKeyPair,
// } from "@/utils/e2ee";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
// const getEntityId = (value) => value?.id || value?._id;

// const Chat = () => {
//   const { user } = useAuth();
//   const { socket } = useSocket();
//   const fileRef = useRef(null);

//   const [users, setUsers] = useState([]);
//   const [chats, setChats] = useState([]);
//   const [activeChat, setActiveChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [typingByChat, setTypingByChat] = useState({});
//   const [privateKey, setPrivateKey] = useState("");

//   const token = localStorage.getItem("token");

//   // Bootstrap: fetch keys, users, chats
//   useEffect(() => {
//     const bootstrap = async () => {
//       if (!user) return;
//       const keyPair = await getStoredKeyPair(getEntityId(user));
//       setPrivateKey(keyPair.privateKey);

//       await axios.put(
//         `${API_BASE_URL}/api/users/keys/public`,
//         { publicKey: keyPair.publicKey },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       await Promise.all([fetchUsers(), fetchChats()]);
//     };

//     bootstrap();
//   }, [user]);

//   // Socket events
//   useEffect(() => {
//     if (!socket) return;

//     socket.on("new-message", onNewMessage);
//     socket.on("message-notification", onMessageNotification);
//     socket.on("user-typing", onUserTyping);
//     socket.on("user-stopped-typing", onUserStoppedTyping);
//     socket.on("message-read", onMessageRead);

//     return () => {
//       socket.off("new-message", onNewMessage);
//       socket.off("message-notification", onMessageNotification);
//       socket.off("user-typing", onUserTyping);
//       socket.off("user-stopped-typing", onUserStoppedTyping);
//       socket.off("message-read", onMessageRead);
//     };
//   }, [socket, activeChat, privateKey]);

//   // Join chat room
//   useEffect(() => {
//     if (!activeChat || !socket) return;
//     socket.emit("join-chat", getEntityId(activeChat));
//     return () => socket.emit("leave-chat", getEntityId(activeChat));
//   }, [activeChat, socket]);

//   // Fetch messages when active chat changes
//   useEffect(() => {
//     if (!activeChat) {
//       setMessages([]);
//       return;
//     }
//     fetchMessages(getEntityId(activeChat));
//   }, [activeChat, privateKey]);

//   const fetchUsers = async () => {
//     const res = await axios.get(`${API_BASE_URL}/api/users`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setUsers(res.data || []);
//   };

//   const fetchChats = async () => {
//     const res = await axios.get(`${API_BASE_URL}/api/chat`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setChats(res.data || []);
//   };

//   const mapDecryptedMessage = async (message) => {
//     try {
//       const decrypted = await decryptMessage(
//         message,
//         getEntityId(user),
//         privateKey,
//       );
//       return {
//         ...message,
//         content: decrypted?.text || "",
//         fileMeta: decrypted?.fileMeta || null,
//       };
//     } catch {
//       return { ...message, content: "[Unable to decrypt message]" };
//     }
//   };

//   const fetchMessages = async (chatId, page = 1) => {
//     const res = await axios.get(
//       `${API_BASE_URL}/api/chat/${chatId}/messages?page=${page}&limit=40`,
//       { headers: { Authorization: `Bearer ${token}` } },
//     );

//     const decrypted = await Promise.all(
//       (res.data.messages || []).map(mapDecryptedMessage),
//     );
//     setMessages(decrypted);

//     decrypted.forEach((msg) => {
//       if (
//         !msg.readBy?.some(
//           (entry) => String(entry.user) === String(getEntityId(user)),
//         )
//       ) {
//         axios.patch(
//           `${API_BASE_URL}/api/chat/${chatId}/messages/${getEntityId(msg)}/read`,
//           {},
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         socket?.emit("message-read", { chatId, messageId: getEntityId(msg) });
//       }
//     });
//   };

//   const onNewMessage = async (data) => {
//     if (String(data.chatId) !== String(getEntityId(activeChat))) return;
//     const decrypted = await mapDecryptedMessage(data.message);
//     setMessages((prev) => [...prev, decrypted]);
//   };

//   const onMessageNotification = (data) => {
//     setChats((prev) =>
//       prev.map((chat) =>
//         String(getEntityId(chat)) === String(data.chatId)
//           ? {
//               ...chat,
//               unreadCount: (chat.unreadCount || 0) + 1,
//               updatedAt: new Date().toISOString(),
//             }
//           : chat,
//       ),
//     );
//   };

//   const onUserTyping = ({ chatId, userId }) =>
//     setTypingByChat((prev) => ({ ...prev, [chatId]: userId }));
//   const onUserStoppedTyping = ({ chatId }) =>
//     setTypingByChat((prev) => {
//       const next = { ...prev };
//       delete next[chatId];
//       return next;
//     });

//   const onMessageRead = ({ messageId, userId }) => {
//     setMessages((prev) =>
//       prev.map((msg) => {
//         if (String(getEntityId(msg)) !== String(messageId)) return msg;
//         if (msg.readBy?.some((entry) => String(entry.user) === String(userId)))
//           return msg;
//         return {
//           ...msg,
//           readBy: [
//             ...(msg.readBy || []),
//             { user: userId, readAt: new Date().toISOString() },
//           ],
//         };
//       }),
//     );
//   };

//   const startChat = async (userId) => {
//     const res = await axios.post(
//       `${API_BASE_URL}/api/chat`,
//       { participantId: userId },
//       { headers: { Authorization: `Bearer ${token}` } },
//     );
//     const chat = res.data;
//     setChats((prev) => [
//       chat,
//       ...prev.filter(
//         (c) => String(getEntityId(c)) !== String(getEntityId(chat)),
//       ),
//     ]);
//     setActiveChat(chat);
//   };

//   const sendMessage = async (textOverride = "", fileMeta = null) => {
//     if (!activeChat) return;
//     const text = textOverride || newMessage;
//     if (!text.trim() && !fileMeta) return;

//     const encrypted = await encryptPayloadForParticipants(
//       { text, fileMeta },
//       activeChat.participants || [],
//     );

//     const res = await axios.post(
//       `${API_BASE_URL}/api/chat/${getEntityId(activeChat)}/message`,
//       {
//         ...encrypted,
//         type: fileMeta ? "file" : "text",
//         fileUrl: fileMeta?.fileUrl || "",
//         fileName: fileMeta?.name || "",
//         mimeType: fileMeta?.type || "",
//       },
//       { headers: { Authorization: `Bearer ${token}` } },
//     );

//     const decrypted = await mapDecryptedMessage(res.data);
//     setMessages((prev) => [...prev, decrypted]);
//     setNewMessage("");

//     const recipientId = getEntityId(
//       activeChat.participants.find(
//         (p) => String(getEntityId(p)) !== String(getEntityId(user)),
//       ),
//     );
//     socket?.emit("send-message", {
//       chatId: getEntityId(activeChat),
//       message: res.data,
//       recipientId,
//     });
//   };

//   const onTyping = (value) => {
//     setNewMessage(value);
//     if (!activeChat || !socket) return;
//     socket.emit("typing-start", { chatId: getEntityId(activeChat) });
//     window.clearTimeout(window.__typingTimeout);
//     window.__typingTimeout = setTimeout(
//       () => socket.emit("typing-stop", { chatId: getEntityId(activeChat) }),
//       800,
//     );
//   };

//   const handleFilePick = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file || !activeChat) return;

//     const arr = await file.arrayBuffer();
//     const { encryptedBuffer, iv, rawKey } = await encryptFileBytes(arr);
//     const encryptedBlob = new Blob([encryptedBuffer], {
//       type: "application/octet-stream",
//     });

//     const formData = new FormData();
//     formData.append("chatId", getEntityId(activeChat));
//     formData.append("file", encryptedBlob, `${file.name}.enc`);

//     const upload = await axios.post(
//       `${API_BASE_URL}/api/chat/upload`,
//       formData,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       },
//     );

//     const fileMeta = {
//       fileUrl: upload.data.fileUrl,
//       name: file.name,
//       type: file.type,
//       iv: exportHelpers.toBase64(iv),
//       fileKey: exportHelpers.toBase64(new Uint8Array(rawKey)),
//     };
//     await sendMessage(`[File] ${file.name}`, fileMeta);
//     event.target.value = "";
//   };

//   const filteredUsers = useMemo(
//     () =>
//       users.filter((u) => {
//         const query = searchTerm.toLowerCase();
//         return (
//           u?.name?.toLowerCase().includes(query) ||
//           u?.email?.toLowerCase().includes(query)
//         );
//       }),
//     [users, searchTerm],
//   );

//   const otherActiveUser = activeChat?.participants?.find(
//     (p) => String(getEntityId(p)) !== String(getEntityId(user)),
//   );

//   return (
//     <div className="h-[calc(100vh-8rem)] flex gap-6">
//       <div className="w-80 space-y-4">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//           <Input
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//         </div>

//         {/* Active Chats */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Active Chats</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea className="h-64">
//               <div className="space-y-2">
//                 {chats.map((chat) => {
//                   const chatId = getEntityId(chat);
//                   const other = chat.participants.find(
//                     (p) => String(getEntityId(p)) !== String(getEntityId(user)),
//                   );
//                   return (
//                     <div
//                       key={chatId}
//                       className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${String(getEntityId(activeChat)) === String(chatId) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//                       onClick={() => setActiveChat(chat)}
//                     >
//                       <Avatar className="h-10 w-10">
//                         <AvatarImage src={other?.avatar} />
//                         <AvatarFallback>
//                           {other?.name?.[0] || "U"}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium truncate">{other?.name}</p>
//                         <p className="text-xs truncate">
//                           {chat.lastMessage?.type || "No messages yet"}
//                         </p>
//                       </div>
//                       {!!chat.unreadCount && (
//                         <Badge variant="destructive">{chat.unreadCount}</Badge>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </ScrollArea>
//           </CardContent>
//         </Card>

//         {/* Start New Chat */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Start New Chat</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea className="h-64">
//               <div className="space-y-2">
//                 {filteredUsers.map((u) => (
//                   <div
//                     key={getEntityId(u)}
//                     className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
//                     onClick={() => startChat(getEntityId(u))}
//                   >
//                     <Avatar className="h-10 w-10">
//                       <AvatarImage src={u.avatar} />
//                       <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
//                     </Avatar>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium truncate">{u.name}</p>
//                       <p className="text-sm text-muted-foreground">{u.role}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Chat Window */}
//       <div className="flex-1 flex flex-col">
//         <Card className="flex-1 flex flex-col">
//           {activeChat ? (
//             <>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle className="text-lg">
//                       {otherActiveUser?.name}
//                     </CardTitle>
//                     <p className="text-xs text-muted-foreground">
//                       {otherActiveUser?.isOnline ? "Online" : "Offline"}
//                     </p>
//                   </div>
//                   {typingByChat[getEntityId(activeChat)] && (
//                     <p className="text-xs text-muted-foreground">Typing...</p>
//                   )}
//                 </div>
//               </CardHeader>

//               <CardContent className="flex-1 flex flex-col min-h-0">
//                 <ScrollArea className="flex-1 min-h-0 pr-4">
//                   <div className="space-y-4 pb-4">
//                     {messages.map((message, idx) => {
//                       const senderId =
//                         getEntityId(message.sender) || message.sender;
//                       const isOwn =
//                         String(senderId) === String(getEntityId(user));
//                       return (
//                         <div
//                           key={getEntityId(message) || idx}
//                           className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
//                         >
//                           <div
//                             className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}
//                           >
//                             <p className="text-sm">{message.content}</p>
//                             {message.fileMeta?.fileUrl && (
//                               <a
//                                 className="underline text-xs"
//                                 href={`${API_BASE_URL}${message.fileMeta.fileUrl}`}
//                                 target="_blank"
//                                 rel="noreferrer"
//                               >
//                                 Download encrypted file
//                               </a>
//                             )}
//                             <p className="text-xs opacity-70 mt-1">
//                               {new Date(
//                                 message.createdAt || Date.now(),
//                               ).toLocaleTimeString()}{" "}
//                               • {message.readBy?.length > 1 ? "Read" : "Sent"}
//                             </p>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </ScrollArea>

//                 <div className="flex items-center space-x-2 pt-4 border-t">
//                   <input
//                     ref={fileRef}
//                     type="file"
//                     className="hidden"
//                     onChange={handleFilePick}
//                   />
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => fileRef.current?.click()}
//                   >
//                     <Paperclip className="h-4 w-4" />
//                   </Button>
//                   <Input
//                     value={newMessage}
//                     onChange={(e) => onTyping(e.target.value)}
//                     placeholder="Type a message..."
//                     onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//                   />
//                   <Button onClick={() => sendMessage()} size="icon">
//                     <Send className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </>
//           ) : (
//             <CardContent className="flex-1 flex items-center justify-center min-h-0">
//               <div className="text-center">
//                 <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <p className="text-muted-foreground">
//                   Select a chat to start encrypted messaging
//                 </p>
//               </div>
//             </CardContent>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Chat;



import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Search, Paperclip } from "lucide-react";
import {
  decryptMessage,
  encryptFileBytes,
  encryptPayloadForParticipants,
  exportHelpers,
  getStoredKeyPair,
} from "@/utils/e2ee";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getEntityId = (value) => value?.id || value?._id;

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const fileRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typingByChat, setTypingByChat] = useState({});
  const [privateKey, setPrivateKey] = useState("");

  const token = localStorage.getItem("token");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Bootstrap: fetch keys, users, chats
  useEffect(() => {
    const bootstrap = async () => {
      if (!user) return;
      const keyPair = await getStoredKeyPair(getEntityId(user));
      setPrivateKey(keyPair.privateKey);

      await axios.put(
        `${API_BASE_URL}/api/users/keys/public`,
        { publicKey: keyPair.publicKey },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await Promise.all([fetchUsers(), fetchChats()]);
    };

    bootstrap();
  }, [user]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", onNewMessage);
    socket.on("message-notification", onMessageNotification);
    socket.on("user-typing", onUserTyping);
    socket.on("user-stopped-typing", onUserStoppedTyping);
    socket.on("message-read", onMessageRead);

    return () => {
      socket.off("new-message", onNewMessage);
      socket.off("message-notification", onMessageNotification);
      socket.off("user-typing", onUserTyping);
      socket.off("user-stopped-typing", onUserStoppedTyping);
      socket.off("message-read", onMessageRead);
    };
  }, [socket, activeChat, privateKey]);

  // Join chat room
  useEffect(() => {
    if (!activeChat || !socket) return;
    socket.emit("join-chat", getEntityId(activeChat));
    return () => socket.emit("leave-chat", getEntityId(activeChat));
  }, [activeChat, socket]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    fetchMessages(getEntityId(activeChat));
  }, [activeChat, privateKey]);

  const fetchUsers = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data || []);
  };

  const fetchChats = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/chat`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setChats(res.data || []);
  };

  const mapDecryptedMessage = async (message) => {
    try {
      const decrypted = await decryptMessage(
        message,
        getEntityId(user),
        privateKey,
      );
      return {
        ...message,
        content: decrypted?.text || "",
        fileMeta: decrypted?.fileMeta || null,
      };
    } catch {
      return { ...message, content: "[Unable to decrypt message]" };
    }
  };

  const fetchMessages = async (chatId, page = 1) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/chat/${chatId}/messages?page=${page}&limit=40`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const decrypted = await Promise.all(
      (res.data.messages || []).map(mapDecryptedMessage),
    );
    setMessages(decrypted);

    decrypted.forEach((msg) => {
      if (
        !msg.readBy?.some(
          (entry) => String(entry.user) === String(getEntityId(user)),
        )
      ) {
        axios.patch(
          `${API_BASE_URL}/api/chat/${chatId}/messages/${getEntityId(msg)}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        socket?.emit("message-read", { chatId, messageId: getEntityId(msg) });
      }
    });
  };

  const onNewMessage = async (data) => {
    if (String(data.chatId) !== String(getEntityId(activeChat))) return;
    const decrypted = await mapDecryptedMessage(data.message);
    setMessages((prev) => [...prev, decrypted]);
  };

  const onMessageNotification = (data) => {
    setChats((prev) =>
      prev.map((chat) =>
        String(getEntityId(chat)) === String(data.chatId)
          ? {
              ...chat,
              unreadCount: (chat.unreadCount || 0) + 1,
              updatedAt: new Date().toISOString(),
            }
          : chat,
      ),
    );
  };

  const onUserTyping = ({ chatId, userId }) =>
    setTypingByChat((prev) => ({ ...prev, [chatId]: userId }));

  const onUserStoppedTyping = ({ chatId }) =>
    setTypingByChat((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });

  const onMessageRead = ({ messageId, userId }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (String(getEntityId(msg)) !== String(messageId)) return msg;
        if (msg.readBy?.some((entry) => String(entry.user) === String(userId)))
          return msg;
        return {
          ...msg,
          readBy: [
            ...(msg.readBy || []),
            { user: userId, readAt: new Date().toISOString() },
          ],
        };
      }),
    );
  };

  const startChat = async (userId) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/chat`,
      { participantId: userId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const chat = res.data;
    setChats((prev) => [
      chat,
      ...prev.filter(
        (c) => String(getEntityId(c)) !== String(getEntityId(chat)),
      ),
    ]);
    setActiveChat(chat);
  };

  const sendMessage = async (textOverride = "", fileMeta = null) => {
    if (!activeChat) return;
    const text = textOverride || newMessage;
    if (!text.trim() && !fileMeta) return;

    const encrypted = await encryptPayloadForParticipants(
      { text, fileMeta },
      activeChat.participants || [],
    );

    const res = await axios.post(
      `${API_BASE_URL}/api/chat/${getEntityId(activeChat)}/message`,
      {
        ...encrypted,
        type: fileMeta ? "file" : "text",
        fileUrl: fileMeta?.fileUrl || "",
        fileName: fileMeta?.name || "",
        mimeType: fileMeta?.type || "",
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const decrypted = await mapDecryptedMessage(res.data);
    setMessages((prev) => [...prev, decrypted]);
    setNewMessage("");

    const recipientId = getEntityId(
      activeChat.participants.find(
        (p) => String(getEntityId(p)) !== String(getEntityId(user)),
      ),
    );
    socket?.emit("send-message", {
      chatId: getEntityId(activeChat),
      message: res.data,
      recipientId,
    });
  };

  const onTyping = (value) => {
    setNewMessage(value);
    if (!activeChat || !socket) return;
    socket.emit("typing-start", { chatId: getEntityId(activeChat) });
    window.clearTimeout(window.__typingTimeout);
    window.__typingTimeout = setTimeout(
      () => socket.emit("typing-stop", { chatId: getEntityId(activeChat) }),
      800,
    );
  };

  const handleFilePick = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeChat) return;

    const arr = await file.arrayBuffer();
    const { encryptedBuffer, iv, rawKey } = await encryptFileBytes(arr);
    const encryptedBlob = new Blob([encryptedBuffer], {
      type: "application/octet-stream",
    });

    const formData = new FormData();
    formData.append("chatId", getEntityId(activeChat));
    formData.append("file", encryptedBlob, `${file.name}.enc`);

    const upload = await axios.post(
      `${API_BASE_URL}/api/chat/upload`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const fileMeta = {
      fileUrl: upload.data.fileUrl,
      name: file.name,
      type: file.type,
      iv: exportHelpers.toBase64(iv),
      fileKey: exportHelpers.toBase64(new Uint8Array(rawKey)),
    };
    await sendMessage(`[File] ${file.name}`, fileMeta);
    event.target.value = "";
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const query = searchTerm.toLowerCase();
        return (
          u?.name?.toLowerCase().includes(query) ||
          u?.email?.toLowerCase().includes(query)
        );
      }),
    [users, searchTerm],
  );

  const otherActiveUser = activeChat?.participants?.find(
    (p) => String(getEntityId(p)) !== String(getEntityId(user)),
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4 overflow-hidden">
        {/* Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Active Chats */}
        <Card
          className="flex flex-col overflow-hidden"
          style={{ flex: "0 0 auto", maxHeight: "45%" }}
        >
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="text-lg">Active Chats</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-2">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-1">
                {chats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active chats
                  </p>
                )}
                {chats.map((chat) => {
                  const chatId = getEntityId(chat);
                  const other = chat.participants.find(
                    (p) => String(getEntityId(p)) !== String(getEntityId(user)),
                  );
                  const isActive =
                    String(getEntityId(activeChat)) === String(chatId);
                  return (
                    <div
                      key={chatId}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveChat(chat)}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={other?.avatar} />
                        <AvatarFallback>
                          {other?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {other?.name}
                        </p>
                        <p
                          className={`text-xs truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {chat.lastMessage?.type || "No messages yet"}
                        </p>
                      </div>
                      {!!chat.unreadCount && (
                        <Badge variant="destructive" className="shrink-0">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Start New Chat */}
        <Card className="flex flex-col overflow-hidden flex-1 min-h-0">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="text-lg">Start New Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-2">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-1">
                {filteredUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found
                  </p>
                )}
                {filteredUsers.map((u) => (
                  <div
                    key={getEntityId(u)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => startChat(getEntityId(u))}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <CardHeader className="shrink-0 border-b py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={otherActiveUser?.avatar} />
                      <AvatarFallback>
                        {otherActiveUser?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base leading-tight">
                        {otherActiveUser?.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {otherActiveUser?.isOnline ? (
                          <span className="text-green-500">● Online</span>
                        ) : (
                          "Offline"
                        )}
                      </p>
                    </div>
                  </div>
                  {typingByChat[getEntityId(activeChat)] && (
                    <p className="text-xs text-muted-foreground italic">
                      Typing...
                    </p>
                  )}
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                {/* Scrollable messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {messages.map((message, idx) => {
                      const senderId =
                        getEntityId(message.sender) || message.sender;
                      const isOwn =
                        String(senderId) === String(getEntityId(user));
                      return (
                        <div
                          key={getEntityId(message) || idx}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          {!isOwn && (
                            <Avatar className="h-7 w-7 mr-2 mt-1 shrink-0">
                              <AvatarImage src={otherActiveUser?.avatar} />
                              <AvatarFallback>
                                {otherActiveUser?.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm break-words">
                              {message.content}
                            </p>
                            {message.fileMeta?.fileUrl && (
                              <a
                                className="underline text-xs block mt-1"
                                href={`${API_BASE_URL}${message.fileMeta.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                📎 Download file
                              </a>
                            )}
                            <p
                              className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                            >
                              {new Date(
                                message.createdAt || Date.now(),
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              ·{" "}
                              {message.readBy?.length > 1
                                ? "✓✓ Read"
                                : "✓ Sent"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Bar — always pinned to bottom
                <div className="shrink-0 flex items-center gap-2 p-3 border-t bg-background">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={handleFilePick}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => onTyping(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                  />
                  <Button
                    onClick={() => sendMessage()}
                    size="icon"
                    className="shrink-0"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div> */}
              </CardContent>
            </>
          ) : (
            /* Empty state */
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No chat selected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a chat or start a new conversation
                  </p>
                </div>
                {/* </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div> */}
              </div>
            </CardContent>
          )}

          <CardContent className="pt-0">
            <div className="shrink-0 flex items-center gap-2 p-3 border-t bg-background">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={handleFilePick}
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => fileRef.current?.click()}
                disabled={!activeChat}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => onTyping(e.target.value)}
                placeholder={
                  activeChat
                    ? "Type a message..."
                    : "Type your message here, then select a chat to send"
                }
                className="flex-1"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  activeChat &&
                  sendMessage()
                }
              />
              <Button
                onClick={() => sendMessage()}
                size="icon"
                className="shrink-0"
                disabled={!activeChat || !newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;