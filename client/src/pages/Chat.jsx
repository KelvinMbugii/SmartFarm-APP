<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    fetchChats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("new-message", handleNewMessage);
      socket.on("message-notification", handleMessageNotification);

      return () => {
        socket.off("new-message");
        socket.off("message-notification");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      setShowChatList(false);
    } else {
      setShowChatList(true);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const handleNewMessage = (data) => {
    if (data.message.chatId === activeChat?.id) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const handleMessageNotification = (data) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === data.chatId
          ? { ...chat, lastMessage: data.message.content, unreadCount: (chat.unreadCount || 0) + 1 }
          : chat
      )
    );
  };

  const startChat = async (userId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { participantId: userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } }
      );
      setChats((prev) => [response.data, ...prev]);
      setActiveChat(response.data);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const messageData = { chatId: activeChat.id, content: newMessage, type: "text" };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/${activeChat.id}/message`,
        messageData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } }
      );
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");

      if (socket) {
        socket.emit("send-message", {
          chatId: activeChat.id,
          message: response.data,
          recipientId: activeChat.participants.find((p) => p.id !== user?.id)?.id,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const goBack = () => {
    setActiveChat(null);
    setShowChatList(true);
    fetchChats();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow-lg">
      {/* Chat List Sidebar - WhatsApp Style */}
      <div className={`${showChatList || !activeChat ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`}>
        {/* Header */}
        <div className="bg-[#128C7E] dark:bg-[#128C7E] p-3 flex items-center justify-between">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-[#075E54] text-white">{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <span className="text-lg">⋮</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#F0F2F5] dark:bg-gray-800 p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-700 border-none rounded-lg h-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 && filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <p className="text-center">No chats yet</p>
              <p className="text-sm">Search for users to start chatting</p>
            </div>
          ) : (
            <>
              {/* Active Chats */}
              {chats.map((chat) => {
                const otherUser = chat.participants.find((p) => p.id !== user?.id);
                return (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      activeChat?.id === chat.id ? "bg-gray-100 dark:bg-gray-800" : ""
                    }`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser?.avatar} />
                      <AvatarFallback className="bg-[#E0E0E0] dark:bg-gray-600">{getInitials(otherUser?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{otherUser?.name}</p>
                        <span className="text-xs text-gray-500">{formatTime(chat.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage || "No messages yet"}</p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-[#25D366] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* New Chat Section */}
              {searchTerm && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <p className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase">Start new chat</p>
                  {filteredUsers.filter(u => !chats.some(c => c.participants.some(p => p.id === u.id))).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => startChat(u.id)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-[#E0E0E0] dark:bg-gray-600">{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area - WhatsApp Style */}
      <div className={`${showChatList && activeChat ? 'hidden' : 'flex'} flex-1 flex-col md:flex`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#128C7E] dark:bg-[#128C7E] p-3 flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={activeChat.participants.find((p) => p.id !== user?.id)?.avatar} />
                <AvatarFallback className="bg-[#075E54] text-white">
                  {getInitials(activeChat.participants.find((p) => p.id !== user?.id)?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {activeChat.participants.find((p) => p.id !== user?.id)?.name}
                </p>
                <p className="text-white/70 text-xs">
                  {activeChat.participants.find((p) => p.id !== user?.id)?.isOnline ? "online" : "offline"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#E5DDD5] dark:bg-gray-800 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:bg-[#0b141a] bg-cover">
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet. Say hi!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSent = message.sender === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${
                            isSent
                              ? "bg-[#DCF8C6] dark:bg-[#056162] text-gray-900 dark:text-white rounded-tr-none"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isSent ? "text-gray-500" : "text-gray-400"}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-[#F0F2F5] dark:bg-gray-900 p-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                <span className="text-xl">+</span>
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white dark:bg-gray-800 border-none rounded-lg"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button 
                onClick={sendMessage} 
                className="bg-[#128C7E] hover:bg-[#075E54] text-white rounded-lg px-4"
                disabled={!newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-gray-900">
            <div className="bg-[#F8F9FA] dark:bg-gray-900 p-8 rounded-full mb-4">
              <svg viewBox="0 0 24 24" className="w-32 h-32 text-[#128C7E]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-light text-gray-600 dark:text-gray-300 mb-2">WhatsApp Web</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              Send and receive messages without keeping your phone online.<br/>
              Use WhatsApp on up to 4 linked devices and 1 phone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
=======
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
>>>>>>> 27cdd59f76de6bdf6ee291e8870fa857bba2388b
