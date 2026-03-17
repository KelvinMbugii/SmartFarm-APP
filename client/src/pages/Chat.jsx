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
