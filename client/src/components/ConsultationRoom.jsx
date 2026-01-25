import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Star,
  Video,
  Phone,
  MapPin,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import consultationService from "@/services/ConsultationService";
import { toast } from "sonner";

export default function ConsultationRoom({ userProfile, onClose }) {
  const { user } = useAuth();
  const [view, setView] = useState("list"); // 'list' | 'new' | 'detail'
  const [consultations, setConsultations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [formData, setFormData] = useState({
    officerId: "",
    subject: "",
    description: "",
    consultationType: "chat",
    scheduledDate: "",
    scheduledTime: "",
  });

  const isRequester = user?.role === "farmer" || user?.role === "agripreneur" || user?.role === "trader";

  useEffect(() => {
    fetchConsultations();
    if (isRequester) {
      fetchOfficers();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const data = await consultationService.getConsultations();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast.error("Failed to load consultations");
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const data = await consultationService.getAvailableOfficers();
      setOfficers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const handleCreateConsultation = async () => {
    try {
      await consultationService.createConsultation(formData);
      toast.success("Consultation request created successfully");
      setFormData({
        officerId: "",
        subject: "",
        description: "",
        consultationType: "chat",
        scheduledDate: "",
        scheduledTime: "",
      });
      fetchConsultations();
      setView("list");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create consultation");
    }
  };

  const handleViewConsultation = async (id) => {
    try {
      const consultation = await consultationService.getConsultation(id);
      setSelectedConsultation(consultation);
      setView("detail");
    } catch (error) {
      toast.error("Failed to load consultation");
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConsultation) return;
    try {
      await consultationService.addMessage(selectedConsultation._id, messageContent);
      setMessageContent("");
      const updated = await consultationService.getConsultation(selectedConsultation._id);
      setSelectedConsultation(updated);
      fetchConsultations();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await consultationService.updateConsultation(id, { status });
      toast.success("Status updated successfully");
      if (selectedConsultation?._id === id) {
        const updated = await consultationService.getConsultation(id);
        setSelectedConsultation(updated);
      }
      fetchConsultations();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedConsultation) return;
    const rating = prompt("Rate this consultation (1-5):");
    const feedback = prompt("Provide your feedback:");
    if (rating && feedback) {
      try {
        await consultationService.submitFeedback(
          selectedConsultation._id,
          parseInt(rating, 10),
          feedback
        );
        toast.success("Feedback submitted successfully");
        const updated = await consultationService.getConsultation(selectedConsultation._id);
        setSelectedConsultation(updated);
        fetchConsultations();
      } catch (error) {
        toast.error("Failed to submit feedback");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: AlertCircle },
      scheduled: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Calendar },
      "in-progress": { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: Clock },
      completed: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status ? String(status).charAt(0).toUpperCase() + String(status).slice(1).replace(/-/g, " ") : "Pending"}
      </Badge>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "video-call": return <Video className="w-4 h-4" />;
      case "phone-call": return <Phone className="w-4 h-4" />;
      case "in-person": return <MapPin className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const otherUser = selectedConsultation
    ? user?.role === "officer"
      ? selectedConsultation.farmer
      : selectedConsultation.officer
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between shrink-0 border-b">
          <div className="flex items-center gap-3">
            {view !== "list" && (
              <Button variant="ghost" size="icon" onClick={() => { setView("list"); setSelectedConsultation(null); }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle>Consultation Room</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pt-4">

          {view === "list" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {user?.name || userProfile?.name || "You"} — manage your consultations
                </p>
                {isRequester && (
                  <Button size="sm" onClick={() => setView("new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    New request
                  </Button>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No consultations yet.</p>
                  {isRequester && (
                    <Button variant="link" className="mt-2" onClick={() => setView("new")}>
                      Start one
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {consultations.map((c) => {
                    const other = user?.role === "officer" ? c.farmer : c.officer;
                    return (
                      <div
                        key={c._id}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleViewConsultation(c._id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={other?.avatar} />
                            <AvatarFallback>{other?.name?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{other?.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{c.subject}</p>
                          </div>
                        </div>
                        {getStatusBadge(c.status)}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {view === "new" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Officer</label>
                <Select
                  value={formData.officerId}
                  onValueChange={(v) => setFormData((p) => ({ ...p, officerId: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Choose an officer" /></SelectTrigger>
                  <SelectContent>
                    {officers.filter(Boolean).map((o) => (
                      <SelectItem key={o._id} value={o._id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="What is this about?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your question..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.consultationType}
                  onValueChange={(v) => setFormData((p) => ({ ...p, consultationType: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="phone-call">Phone</SelectItem>
                    <SelectItem value="video-call">Video</SelectItem>
                    <SelectItem value="in-person">In person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.consultationType === "video-call" || formData.consultationType === "in-person") && (
                <>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData((p) => ({ ...p, scheduledDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData((p) => ({ ...p, scheduledTime: e.target.value }))}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
                <Button onClick={handleCreateConsultation}>Create request</Button>
              </div>
            </div>
          )}

          {view === "detail" && selectedConsultation && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <Avatar>
                  <AvatarImage src={otherUser?.avatar} />
                  <AvatarFallback>{otherUser?.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{otherUser?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedConsultation.subject}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {getStatusBadge(selectedConsultation.status)}
                  <Badge variant="outline">{getTypeIcon(selectedConsultation.consultationType)}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{selectedConsultation.description}</p>

              <div>
                <h4 className="font-medium mb-2">Messages</h4>
                <ScrollArea className="h-48 border rounded-lg p-3">
                  <div className="space-y-3">
                    {(selectedConsultation.messages || []).map((msg, i) => {
                      const isOwn = msg.sender?._id === user?.id || msg.sender === user?.id;
                      return (
                        <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                              isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? "opacity-80" : "text-muted-foreground"}`}>
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {selectedConsultation.status !== "completed" && selectedConsultation.status !== "cancelled" && (
                <div className="flex gap-2">
                  <Input
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                <div className="flex gap-2">
                  {user?.role === "officer" && selectedConsultation.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleUpdateStatus(selectedConsultation._id, "scheduled")}>
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedConsultation._id, "in-progress")}>
                        Start
                      </Button>
                    </>
                  )}
                  {selectedConsultation.status === "in-progress" && (
                    <Button size="sm" onClick={() => handleUpdateStatus(selectedConsultation._id, "completed")}>
                      Complete
                    </Button>
                  )}
                </div>
                {isRequester && selectedConsultation.status === "completed" && !selectedConsultation.rating && (
                  <Button size="sm" variant="outline" onClick={handleSubmitFeedback}>
                    <Star className="h-4 w-4 mr-1" /> Feedback
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

