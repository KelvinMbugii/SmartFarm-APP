import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Search, Plus } from "lucide-react";

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chat", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const handleNewMessage = (data) => {
    setMessages((prev) => [...prev, data.message]);
  };

  const handleMessageNotification = (data) => {
    // Update chat list with new message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === data.chatId
          ? {
              ...chat,
              lastMessage: data.message.content,
              unreadCount: chat.unreadCount + 1,
            }
          : chat
      )
    );
  };

  const startChat = async (userId) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ participantId: userId }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats((prev) => [newChat, ...prev]);
        setActiveChat(newChat);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      chatId: activeChat.id,
      content: newMessage,
      type: "text",
    };

    try {
      const response = await fetch(`/api/chat/${activeChat.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");

        // Emit to socket
        if (socket) {
          socket.emit("send-message", {
            chatId: activeChat.id,
            message,
            recipientId: activeChat.participants.find((p) => p.id !== user?.id)
              ?.id,
          });
        }
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

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar */}
      <div className="w-80 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Active Chats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {chats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active chats
                </p>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => {
                    const otherUser = chat.participants.find(
                      (p) => p.id !== user?.id
                    );
                    return (
                      <div
                        key={chat.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          activeChat?.id === chat.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setActiveChat(chat)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser?.avatar} />
                          <AvatarFallback>
                            {otherUser?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {otherUser?.name}
                            </p>
                            {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Available Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Start New Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {filteredUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No users found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => startChat(u.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">{u.name}</p>
                          {u.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {u.role === "farmer"
                            ? "Farmer"
                            : "Agricultural Officer"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        <Card className="h-full">
          {activeChat ? (
            <>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        activeChat.participants.find((p) => p.id !== user?.id)
                          ?.avatar
                      }
                    />
                    <AvatarFallback>
                      {activeChat.participants
                        .find((p) => p.id !== user?.id)
                        ?.name.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {
                        activeChat.participants.find((p) => p.id !== user?.id)
                          ?.name
                      }
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {activeChat.participants.find((p) => p.id !== user?.id)
                        ?.isOnline
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a chat to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
