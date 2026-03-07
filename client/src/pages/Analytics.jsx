import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Send, Image as ImageIcon, FileText, Bot } from "lucide-react";
import aiService from "@/services/AIService";
import { toast } from "sonner";

const MessageBubble = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {content}
      </div>
    </div>
  );
};

export default function Analytics() {
  const fileRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m the SmartFarm AI Assistant. Ask a farming question, or upload a crop image / soil report.\n\n(Ready for future AI model integration.)",
    },
  ]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    const merged = [...files, ...picked].slice(0, 5);
    setFiles(merged);
    e.target.value = "";
  };

  const send = async () => {
    const message = text.trim();
    if (!message && files.length === 0) {
      toast.error("Type a message or upload a file.");
      return;
    }
    setSending(true);
    try {
      if (message) setMessages((m) => [...m, { role: "user", content: message }]);
      setText("");
      const res = await aiService.assist({ message, files });
      setFiles([]);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e) {
      toast.error(e.response?.data?.error || "AI assistant request failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          SmartFarm AI Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Repurposed from the Charts page. Chat, upload images for disease
          detection, or upload documents for advisory support (AI-ready).
        </p>
      </div>

      <Card className="max-w-5xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> Assistant Chat
          </CardTitle>
          <Badge variant="secondary">AI-ready pipeline</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[360px] overflow-y-auto border rounded-lg p-4 space-y-3 bg-background">
            {messages.map((m, idx) => (
              <MessageBubble key={idx} role={m.role} content={m.content} />
            ))}
          </div>

          {/* Uploads */}
          <div className="flex flex-wrap gap-2 items-center">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf,.csv,.txt,.doc,.docx"
              onChange={onPickFiles}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload image/file
            </Button>
            <span className="text-xs text-muted-foreground">
              Up to 5 files (10MB each)
            </span>
          </div>

          {files.length > 0 && (
            <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
              <p className="text-sm font-medium">Selected files</p>
              <div className="space-y-2">
                {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {f.type?.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((f.size || 0) / 1024)} KB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="grid gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about planting, pests, disease symptoms, fertilizer rates, market strategy..."
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button onClick={send} disabled={sending} className="gap-2">
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

