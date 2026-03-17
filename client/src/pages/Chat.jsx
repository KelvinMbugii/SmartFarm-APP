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

import { MessageCircle, Send, Search, ImagePlus } from "lucide-react";

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
    setMessages((prev) => [...prev, decrypted]);
  };

  const onlineUserList = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const isOnline = onlineUsers.includes(getEntityId(u));
      if (!isOnline) return false;
      if (!query) return true;
      return (
        u?.name?.toLowerCase().includes(query) ||
        u?.email?.toLowerCase().includes(query) ||
        String(u?.role || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [users, onlineUsers, searchTerm]);

  const selectedOnlineUser = onlineUserList.find(
    (u) => String(getEntityId(u)) === String(selectedOnlineUserId),
  );

  const openChat = async (chat) => {
    setActiveChat(chat);
    await fetchMessages(getEntityId(chat));
    navigate(`/chat/${getEntityId(chat)}`);
  };

  const startChat = async () => {
    if (!selectedOnlineUserId) return;

    const existingChat = chats.find((chat) =>
      chat?.participants?.some(
        (participant) =>
          String(getEntityId(participant)) === String(selectedOnlineUserId),
      ),
    );

    if (existingChat) {
      await openChat(existingChat);
      return;
    }

    const res = await axios.post(
      `${API_BASE_URL}/api/chat`,
      { participantId: selectedOnlineUserId },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const chat = res.data;
    setChats((prev) => [chat, ...prev]);
    await openChat(chat);
  };

  const sendMessage = async (messageText = newMessage, imageMeta = null) => {
    if (!activeChat) return;

    const text = messageText.trim();
    if (!text && !imageMeta) return;

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
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeChat) return;

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
    } finally {
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
            placeholder="Search online users by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Online Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-2">
                {onlineUserList.map((u) => {
                  const userId = getEntityId(u);
                  const isSelected =
                    String(userId) === String(selectedOnlineUserId);

                  return (
                    <button
                      type="button"
                      key={userId}
                      className={`w-full flex items-center gap-3 p-2 rounded text-left border ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-muted"
                      }`}
                      onClick={() => setSelectedOnlineUserId(userId)}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.email}
                        </p>
                      </div>
                      <Badge variant="secondary">{u.role || "user"}</Badge>
                    </button>
                  );
                })}
                {onlineUserList.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No online users found.
                  </p>
                )}
              </div>
            </ScrollArea>

            <Button
              className="w-full"
              onClick={startChat}
              disabled={!selectedOnlineUser}
            >
              {selectedOnlineUser
                ? `Start chat with ${selectedOnlineUser.name}`
                : "Select an online user to start chat"}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1 min-h-0">
          <CardHeader className="pb-2">
            <CardTitle>Past Chats</CardTitle>
          </CardHeader>
          <CardContent className="h-full pb-3">
            <ScrollArea className="h-full">
              <div className="space-y-2 pr-2">
                {chats.map((chat) => {
                  const chatEntityId = getEntityId(chat);
                  const isActive =
                    String(chatEntityId) === String(getEntityId(activeChat));
                  const chatUser = chat?.participants?.find(
                    (participant) =>
                      String(getEntityId(participant)) !==
                      String(getEntityId(user)),
                  );

                  return (
                    <button
                      type="button"
                      key={chatEntityId}
                      className={`w-full p-2 rounded text-left border ${
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-muted"
                      }`}
                      onClick={() => openChat(chat)}
                    >
                      <p className="font-medium truncate">
                        {chatUser?.name || "Unknown user"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {chatUser?.role || "user"}
                      </p>
                    </button>
                  );
                })}
                {chats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No past chats yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col min-h-0">
          {activeChat ? (
            <>
              <CardHeader className="border-b">
                <CardTitle>{otherUser?.name || "Conversation"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Role: {otherUser?.role || "user"}
                </p>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto py-4">
                <div className="space-y-3">
                  {messages.map((msg, i) => {
                    const senderId = getEntityId(msg.sender) || msg.sender;
                    const isOwn =
                      String(senderId) === String(getEntityId(user));

                    return (
                      <div
                        key={getEntityId(msg) || i}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                            isOwn
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-emerald-100 text-emerald-950 rounded-bl-sm"
                          }`}
                        >
                          {msg.text && (
                            <p className="text-sm break-words">{msg.text}</p>
                          )}
                          {msg.imageMeta?.fileUrl && (
                            <img
                              src={resolveFileUrl(msg.imageMeta.fileUrl)}
                              alt={msg.imageMeta.name || "Uploaded image"}
                              className="mt-2 rounded-lg max-h-60 w-auto"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="flex gap-2 p-3 border-t">
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => imageRef.current?.click()}
                  title="Upload image"
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Select an online user and start chatting.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;