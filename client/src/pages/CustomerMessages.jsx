import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Mail,
  FileText,
  Upload,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import api from "@/services/api";
import { toast } from "sonner";

export default function CustomerMessages() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [chats, setChats] = useState([]);
  const [useMock, setUseMock] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState([]);

  // Filter chats where the other participant is a farmer (customer)
  const farmerChats = useMemo(() => {
    if (!user) return [];
    const uid = user.id || user._id;
    return (chats || []).filter((chat) => {
      const other =
        chat.participants?.find(
          (p) => (p.id || p._id)?.toString() !== uid?.toString()
        ) || null;
      return other && String(other.role || "").toLowerCase() === "farmer";
    });
  }, [chats, user]);

  const activeThread =
    farmerChats.find((c) => c.id === activeId || c._id === activeId) || null;

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await api.get("/api/chat");
        setChats(Array.isArray(data) ? data : []);
        setUseMock(false);
      } catch (e) {
        toast.error("Failed to load customer messages, using mock data.");
        setUseMock(true);
        // Minimal mock thread for fallback
        setChats([
          {
            id: "mock-t1",
            participants: [
              { id: "customer-1", name: "Farmer Alice", role: "farmer" },
              { id: "seller", name: user?.name || "You", role: user?.role },
            ],
            lastMessage: new Date().toISOString(),
          },
        ]);
        setActiveId("mock-t1");
        setMessages([
          {
            id: "mock-m1",
            sender: { id: "customer-1", name: "Farmer Alice" },
            content:
              "Hi, I want to confirm the recommended seed rate for your hybrid maize seeds.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };
    if (user) loadChats();
  }, [user]);

  // When a thread is selected, load its messages
  const handleSelectThread = async (chatId) => {
    setActiveId(chatId);
    setFiles([]);
    setReply("");

    if (useMock) {
      // In mock mode we don't have per-chat API, keep existing messages
      return;
    }

    try {
      const { data } = await api.get(`/api/chat/${chatId}`);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (e) {
      toast.error("Failed to load conversation");
      setMessages([]);
    }
  };

  // Socket: live new messages
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (data) => {
      if (!data || !data.chatId || !data.message) return;
      if (!activeId || data.chatId !== activeId) return;
      setMessages((prev) => [...prev, data.message]);
    };
    socket.on("new-message", onNewMessage);
    return () => {
      socket.off("new-message", onNewMessage);
    };
  }, [socket, activeId]);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    setFiles(picked.slice(0, 5));
    e.target.value = "";
  };

  const sendReply = () => {
    if (!activeThread) return;
    if (!reply.trim() && files.length === 0) {
      toast.error("Type a reply or attach a file.");
      return;
    }
    if (useMock) {
      const newMessage = {
        id: `local-${Date.now()}`,
        sender: { id: user?.id || "seller", name: user?.name || "You" },
        content: reply.trim() || "(Attachment only)",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setReply("");
      setFiles([]);
      toast.success("Reply recorded (mock).");
      return;
    }

    const chatId = activeThread.id || activeThread._id;
    const content =
      reply.trim() ||
      `Attachment(s): ${files.map((f) => f.name).join(", ") || "file"}`;

    api
      .post(`/api/chat/${chatId}/message`, { content, type: "text" })
      .then((res) => {
        setMessages((prev) => [...prev, res.data]);
        setReply("");
        setFiles([]);
      })
      .catch((e) => {
        toast.error(
          e.response?.data?.error || "Failed to send reply. Please try again."
        );
      });
  };

  const threads = farmerChats;

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left: thread list */}
      <div className="w-80 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Messages</CardTitle>
            <CardDescription>
              Respond to farmer questions about your products and orders.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="flex-1 min-h-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[360px]">
              <div className="space-y-1 p-3">
                {threads.map((chat) => {
                  const uid = user?.id || user?._id;
                  const other =
                    chat.participants?.find(
                      (p) => (p.id || p._id)?.toString() !== uid?.toString()
                    ) || {};
                  const id = chat.id || chat._id;
                  const name = other.name || "Customer";
                  const createdAt = chat.lastMessage
                    ? new Date(chat.lastMessage).toLocaleString()
                    : "";
                  return (
                  <button
                    key={id}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      activeId === id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/60"
                    }`}
                    onClick={() => handleSelectThread(id)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Customer inquiry
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {createdAt}
                    </p>
                  </button>
                );})}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: conversation */}
      <div className="flex-1">
        <Card className="h-full flex flex-col">
          {activeThread ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(() => {
                        const uid = user?.id || user?._id;
                        const other =
                          activeThread.participants?.find(
                            (p) =>
                              (p.id || p._id)?.toString() !== uid?.toString()
                          ) || {};
                        return (
                          other.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "C"
                        );
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {(() => {
                        const uid = user?.id || user?._id;
                        const other =
                          activeThread.participants?.find(
                            (p) =>
                              (p.id || p._id)?.toString() !== uid?.toString()
                          ) || {};
                        return other.name || "Customer";
                      })()}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Customer inquiry
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-4 gap-4">
                <ScrollArea className="flex-1 pr-3">
                  <div className="space-y-3">
                    {messages.map((m) => {
                      const senderId =
                        m.sender?._id || m.sender?.id || m.sender;
                      const mine =
                        senderId &&
                        (senderId.toString() === (user?.id || user?._id)?.toString());
                      return (
                        <div
                          key={m.id}
                          className={`flex ${
                            mine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                              mine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{m.content}</p>
                            <p className="text-[10px] opacity-70 mt-1">
                              {m.timestamp
                                ? new Date(m.timestamp).toLocaleTimeString()
                                : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Attachments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Attach images or documents (e.g., product brochures,
                        invoices)
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                      <Upload className="h-3 w-3" />
                      <span>Upload</span>
                      <Input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="hidden"
                        onChange={onPickFiles}
                      />
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {files.map((f, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {f.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply box */}
                <div className="flex items-end gap-2 pt-2 border-t">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    rows={2}
                  />
                  <Button onClick={sendReply} className="self-stretch gap-1">
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm">
                  Select a message thread to view and respond.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

