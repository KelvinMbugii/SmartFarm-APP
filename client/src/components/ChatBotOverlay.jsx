import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Upload, Image as ImageIcon, FileText, Bot, Paperclip, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
          isUser
            ? "bg-[#1B4332] text-white rounded-br-md"
            : "bg-white text-[#1B4332] rounded-bl-md shadow-sm"
        )}
      >
        {message.type === "image" && message.content && (
          <img
            src={message.content}
            alt="Uploaded"
            className="max-w-full rounded-lg mb-2 max-h-48 object-contain"
          />
        )}
        {message.type === "file" && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-[#F8F5F2] rounded-lg">
            <FileText className="h-4 w-4 text-[#1B4332]" />
            <span className="text-xs truncate">{message.fileName}</span>
          </div>
        )}
        <p className="font-body">{message.text}</p>
        <p className={cn("text-[10px] mt-1 opacity-60", isUser ? "text-white/70" : "text-[#1B4332]/60")}>
          {message.timestamp}
        </p>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex justify-start"
  >
    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#1B4332] rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export default function ChatBotOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm your SmartFarm assistant. Ask me about farming, upload images for disease detection, or share files for analysis.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && chatRef.current) {
      chatRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim() && files.length === 0) return;

    const newMessages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const message = {
          id: Date.now() + Math.random(),
          sender: "user",
          text: `Uploaded: ${file.name}`,
          content: file.type.startsWith("image/") ? e.target.result : null,
          fileName: file.name,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: file.type.startsWith("image/") ? "image" : "file",
        };
        setMessages((prev) => [...prev, message]);
      };
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        const message = {
          id: Date.now() + Math.random(),
          sender: "user",
          text: `Uploaded: ${file.name}`,
          content: null,
          fileName: file.name,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "file",
        };
        newMessages.push(message);
      }
    });

    if (inputValue.trim()) {
      const textMessage = {
        id: Date.now(),
        sender: "user",
        text: inputValue,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };
      newMessages.push(textMessage);
    }

    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages]);
    }

    setInputValue("");
    setFiles([]);
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "That's a great question! Based on current conditions, I'd recommend checking soil moisture levels.",
        "For optimal results, consider these factors: weather, soil quality, and irrigation timing.",
        "I've analyzed your query. Here's what I suggest for your farming needs...",
        "Great input! Let me provide some guidance based on agricultural best practices.",
        "Your question has been noted. Here's some expert advice for your situation...",
      ];
      const botResponse = {
        id: Date.now() + 1,
        sender: "bot",
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-[20px] shadow-2xl flex flex-col overflow-hidden z-50"
            style={{ maxHeight: "calc(100vh - 8rem)" }}
          >
            <div className="flex items-center justify-between p-4 bg-[#1B4332] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E9B44C]/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-[#E9B44C]" />
                </div>
                <div>
                  <h3 className="font-semibold font-heading text-white">SmartFarm Assistant</h3>
                  <p className="text-xs text-white/70">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={chatRef}
              tabIndex={-1}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F5F2]"
            >
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {files.length > 0 && (
              <div className="px-4 py-2 border-t border-[#E0DCD7] bg-white">
                <p className="text-xs font-medium text-[#1B4332]/60 mb-2 font-heading">Attached files:</p>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#F8F5F2] border border-[#E0DCD7] rounded-full px-3 py-1.5 text-xs"
                    >
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-3 w-3 text-[#1B4332]" />
                      ) : (
                        <FileText className="h-3 w-3 text-[#1B4332]" />
                      )}
                      <span className="truncate max-w-[120px] font-body">{file.name}</span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-[#E0DCD7] bg-white">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about farming, crops, weather..."
                    className="w-full px-4 py-3 pr-12 border border-[#E0DCD7] rounded-full bg-[#F8F5F2] resize-none focus:outline-none focus:border-[#E9B44C] focus:ring-2 focus:ring-[#E9B44C]/25 text-sm font-body"
                    rows={1}
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.csv,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 bottom-3 p-1 hover:bg-[#E0DCD7] rounded-full transition-colors"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4 text-[#1B4332]" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && files.length === 0}
                  className="p-3 bg-[#E9B44C] text-[#1B4332] rounded-full hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 font-heading font-semibold"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && isMinimized && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#E9B44C] text-[#1B4332] rounded-full shadow-lg hover:brightness-110 transition-all hover:scale-105 flex items-center justify-center z-50"
          aria-label="Open chat"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
      )}

      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#E9B44C] text-[#1B4332] rounded-full shadow-lg hover:brightness-110 transition-all flex items-center justify-center z-50"
          aria-label="Open chat"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
      )}
    </>
  );
}
