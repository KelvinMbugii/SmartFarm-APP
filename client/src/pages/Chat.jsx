import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useNavigate, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { MessageCircle, Send, Search, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  decryptMessage,
  decryptFileBytes,
  encryptFileBytes,
  encryptPayloadForParticipants,
  exportHelpers,
  getStoredKeyPair,
} from "@/utils/e2ee";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getEntityId = (value) => value?.id || value?._id;

const EncryptedImage = ({ fileUrl, iv, fileKey, name, type }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    const load = async () => {
      try {
        const url = fileUrl.startsWith("http") ? fileUrl : `${API_BASE_URL}${fileUrl || ""}`;
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        
        if (iv && fileKey) {
          const decrypted = await decryptFileBytes(res.data, iv, fileKey);
          const blob = new Blob([decrypted], { type: type || 'image/jpeg' });
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        } else {
           const blob = new Blob([res.data], { type: type || 'image/jpeg' });
           objectUrl = URL.createObjectURL(blob);
           setSrc(objectUrl);
        }
      } catch (e) {
        console.error("Failed to decrypt image", e);
      }
    };
    if (fileUrl) load();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl, iv, fileKey, type]);

  if (!src) return <div className="mt-1 w-40 h-40 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md" />;

  return (
    <img
      src={src}
      alt={name || "Uploaded image"}
      className="mt-1 rounded-md max-h-60 w-auto relative z-10"
    />
  );
};

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { chatId } = useParams();

  const imageRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedOnlineUserId, setSelectedOnlineUserId] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isSending, setIsSending] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  useEffect(() => {
    if (!socket) return;

    socket.on("online-users", setOnlineUsers);
    socket.on("new-message", onNewMessage);

    return () => {
      socket.off("online-users");
      socket.off("new-message");
    };
  }, [socket, activeChat, privateKey]);

  useEffect(() => {
    if (!chatId || chats.length === 0) return;

    const found = chats.find((c) => String(getEntityId(c)) === String(chatId));
    if (found) {
      setActiveChat(found);
      fetchMessages(getEntityId(found));
    }
  }, [chatId, chats, privateKey]);

  useEffect(() => {
    if (!activeChat || !socket) return;

    socket.emit("join-chat", getEntityId(activeChat));

    return () => socket.emit("leave-chat", getEntityId(activeChat));
  }, [activeChat, socket]);

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

  const mapMessage = async (msg) => {
    const decrypted = await decryptMessage(msg, getEntityId(user), privateKey);
    return {
      ...msg,
      ...(decrypted || {}),
    };
  };

  const fetchMessages = async (targetChatId) => {
    if (!targetChatId) return;

    const res = await axios.get(
      `${API_BASE_URL}/api/chat/${targetChatId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const decrypted = await Promise.all(
      (res.data.messages || []).map(mapMessage),
    );
    setMessages(decrypted.filter(Boolean));
  };

  const onNewMessage = async ({ chatId: incomingChatId, message }) => {
    if (String(incomingChatId) !== String(getEntityId(activeChat))) return;

    const decrypted = await mapMessage(message);
    setMessages((prev) => {
      const exists = prev.some((m) => String(getEntityId(m)) === String(getEntityId(message)));
      if (exists) return prev;
      return [...prev, decrypted];
    });
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      // Exclude current user from their own list
      if (String(getEntityId(u)) === String(getEntityId(user))) return false;
      // Exclude admins
      if (String(u?.role).toLowerCase() === "admin") return false;

      if (!query) return true;
      return (
        u?.name?.toLowerCase().includes(query) ||
        String(u?.role || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [users, searchTerm, user]);

  const openChat = async (chat) => {
    try {
      setActiveChat(chat);
      await fetchMessages(getEntityId(chat));
      navigate(`/chat/${getEntityId(chat)}`);
    } catch (error) {
      console.error("openChat error:", error);
      toast.error("Failed to open chat: " + error.message);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      setSelectedOnlineUserId(userId);

      const existingChat = chats.find((chat) =>
        chat?.participants?.some(
          (participant) =>
            String(getEntityId(participant)) === String(userId),
        ),
      );

      if (existingChat) {
        await openChat(existingChat);
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { participantId: userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const chat = res.data;
      setChats((prev) => [chat, ...prev]);
      await openChat(chat);
    } catch (error) {
      console.error("handleUserClick error:", error);
      toast.error(error.response?.data?.error || error.message || "Failed to start chat");
    }
  };

  const sendMessage = async (messageText = newMessage, imageMeta = null) => {
    if (!activeChat || isSending) return;

    const text = messageText.trim();
    if (!text && !imageMeta) return;

    setIsSending(true);
    try {
      const encrypted = await encryptPayloadForParticipants(
        { text, imageMeta },
        activeChat.participants,
      );

      const res = await axios.post(
        `${API_BASE_URL}/api/chat/${getEntityId(activeChat)}/message`,
        encrypted,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const decrypted = await mapMessage(res.data);
      setMessages((prev) => [...prev, decrypted]);
      setNewMessage("");

      socket?.emit("send-message", {
        chatId: getEntityId(activeChat),
        message: res.data,
      });
    } catch (error) {
      console.error("sendMessage error:", error);
      toast.error("Failed to send message: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeChat || isSending) return;

    setIsSending(true);
    try {
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await sendMessage("", {
        fileUrl: upload.data.fileUrl,
        name: file.name,
        type: file.type,
        iv: exportHelpers.toBase64(iv),
        fileKey: exportHelpers.toBase64(new Uint8Array(rawKey)),
      });
    } catch (error) {
      console.error("handleImageUpload error:", error);
      toast.error("Failed to upload image: " + error.message);
    } finally {
      setIsSending(false);
      event.target.value = "";
    }
  };

  const otherUser = activeChat?.participants?.find(
    (p) => String(getEntityId(p)) !== String(getEntityId(user)),
  );

  const resolveFileUrl = (fileUrl) =>
    fileUrl?.startsWith("http") ? fileUrl : `${API_BASE_URL}${fileUrl || ""}`;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      <div className="w-80 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card className="flex-1 min-h-0 flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 min-h-0 flex flex-col pb-4">
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {filteredUsers.map((u) => {
                  const userId = getEntityId(u);
                  const isSelected =
                    String(userId) === String(selectedOnlineUserId);
                  const isOnline = onlineUsers.includes(userId);

                  return (
                    <button
                      type="button"
                      key={userId}
                      className={`w-full flex items-center gap-3 p-2 rounded text-left border ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-muted"
                      }`}
                      onClick={() => handleUserClick(userId)}
                    >
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">
                          {u.role || "user"}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No users found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

      </div>

      {/* Right Side - WhatsApp Style Chat */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-border bg-[#efeae2] dark:bg-[#0b141a] rounded-r-lg overflow-hidden">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 shrink-0 flex items-center px-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b shadow-sm z-10 gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser?.avatar} />
                <AvatarFallback className="bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {otherUser?.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {otherUser?.name || "Conversation"}
                </h3>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                  <span className="capitalize">{otherUser?.role || "user"}</span>
                  <span>•</span>
                  {onlineUsers.includes(getEntityId(otherUser)) ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                  ) : (
                    <span>Offline</span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0">
              {messages.map((msg, i) => {
                const senderId = getEntityId(msg.sender) || msg.sender;
                const isOwn = String(senderId) === String(getEntityId(user));

                return (
                  <div
                    key={getEntityId(msg) || i}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 shadow-sm relative ${
                        isOwn
                          ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tr-none"
                          : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tl-none"
                      }`}
                    >
                      {/* Tail styling */}
                      {isOwn ? (
                        <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-[7px] text-[#d9fdd3] dark:text-[#005c4b] fill-current">
                          <path d="M5.188 1H0v11.156l4.484-4.805A4.5 4.5 0 015.188 1z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-[7px] text-white dark:text-[#202c33] fill-current">
                          <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.026 1.533 3.568z" />
                        </svg>
                      )}

                      {msg.text && (
                        <p className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap relative z-10">
                          {msg.text}
                        </p>
                      )}
                      {msg.imageMeta?.fileUrl && (
                        <EncryptedImage
                          fileUrl={msg.imageMeta.fileUrl}
                          iv={msg.imageMeta.iv}
                          fileKey={msg.imageMeta.fileKey}
                          name={msg.imageMeta.name}
                          type={msg.imageMeta.type}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="shrink-0 flex items-center gap-2 p-3 bg-[#f0f2f5] dark:bg-[#202c33] w-full">
              <input
                ref={imageRef}
                type="file"
                accept="image/*,video/*,application/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-[#54656f] dark:text-[#8696a0] hover:bg-black/5 dark:hover:bg-white/5 h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                onClick={() => imageRef.current?.click()}
                title="Attach file"
                disabled={isSending}
              >
                <Plus className="h-[24px] w-[24px]" />
              </Button>
              <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg flex items-center shadow-sm min-w-0 border-transparent focus-within:border-zinc-300 transition-all">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-[44px] px-4 text-[15.5px] text-[#111b21] dark:text-[#e9edef] placeholder:text-[#54656f] dark:placeholder:text-[#8696a0]"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#54656f] dark:text-[#8696a0] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                onClick={() => sendMessage()}
                disabled={!newMessage.trim() || isSending}
              >
                <Send className="h-[20px] w-[20px]" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-[#f0f2f5] dark:bg-[#222e35] flex flex-col items-center justify-center p-8 border-b-8 border-green-500">
            {/* Empty state replacing placeholder text */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
