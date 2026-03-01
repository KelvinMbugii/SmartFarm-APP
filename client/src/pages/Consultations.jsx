import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Star,
  User,
  Video,
  Phone,
  MapPin,
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import consultationService from "@/services/ConsultationService";
import { toast } from "sonner";

const Consultations = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [formData, setFormData] = useState({
    officerId: "",
    subject: "",
    description: "",
    consultationType: "chat",
    scheduledDate: "",
    scheduledTime: ""
  });

  useEffect(() => {
    fetchConsultations();
    if (user?.role === "farmer") {
      fetchOfficers();
    }
  }, [user]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const data = await consultationService.getConsultations();
      setConsultations(data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast.error("Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const data = await consultationService.getAvailableOfficers();
      setOfficers(data);
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const handleCreateConsultation = async () => {
    try {
      await consultationService.createConsultation(formData);
      toast.success("Consultation request created successfully");
      setShowCreateModal(false);
      setFormData({
        officerId: "",
        subject: "",
        description: "",
        consultationType: "chat",
        scheduledDate: "",
        scheduledTime: ""
      });
      fetchConsultations();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create consultation");
    }
  };

  const handleViewConsultation = async (id) => {
    try {
      const consultation = await consultationService.getConsultation(id);
      setSelectedConsultation(consultation);
    } catch (error) {
      toast.error("Failed to load consultation");
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConsultation) return;

    try {
      await consultationService.addMessage(selectedConsultation._id, messageContent);
      setMessageContent("");
      handleViewConsultation(selectedConsultation._id);
      fetchConsultations();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await consultationService.updateConsultation(id, { status });
      toast.success("Status updated successfully");
      fetchConsultations();
      if (selectedConsultation?._id === id) {
        handleViewConsultation(id);
      }
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
        await consultationService.submitFeedback(selectedConsultation._id, parseInt(rating), feedback);
        toast.success("Feedback submitted successfully");
        handleViewConsultation(selectedConsultation._id);
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
      cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </Badge>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "video-call":
        return <Video className="w-4 h-4" />;
      case "phone-call":
        return <Phone className="w-4 h-4" />;
      case "in-person":
        return <MapPin className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading && consultations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Consultations</h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === "farmer"
              ? "Book consultations with agricultural officers"
              : "Manage consultation requests from farmers"}
          </p>
        </div>
        {user?.role === "farmer" && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Consultation
          </Button>
        )}
      </div>

      {/* Consultations List */}
      <div className="grid grid-cols-1 gap-4">
        {consultations.map((consultation) => {
          const otherUser = user?.role === "farmer" ? consultation.officer : consultation.farmer;
          return (
            <Card
              key={consultation._id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleViewConsultation(consultation._id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar>
                      <AvatarImage src={otherUser?.avatar} />
                      <AvatarFallback>
                        {otherUser?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{otherUser?.name}</h3>
                        {otherUser?.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="font-medium mb-1">{consultation.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {consultation.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {getTypeIcon(consultation.consultationType)}
                          <span className="capitalize">
                            {consultation.consultationType.replace("-", " ")}
                          </span>
                        </div>
                        {consultation.scheduledDate && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(consultation.scheduledDate).toLocaleDateString()}
                          </div>
                        )}
                        {consultation.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < consultation.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(consultation.status)}
                    {consultation.messages?.length > 0 && (
                      <Badge variant="outline">
                        {consultation.messages.length} messages
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {consultations.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No consultations found</p>
          </CardContent>
        </Card>
      )}

      {/* Create Consultation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New Consultation Request</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Officer</label>
                <Select
                  value={formData.officerId}
                  onValueChange={(value) => setFormData({ ...formData, officerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer) => (
                      <SelectItem key={officer._id} value={officer._id}>
                        <div className="flex items-center gap-2">
                          {officer.name}
                          {officer.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What is this consultation about?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your question or issue..."
                  rows={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Consultation Type</label>
                <Select
                  value={formData.consultationType}
                  onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="phone-call">Phone Call</SelectItem>
                    <SelectItem value="video-call">Video Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.consultationType === "video-call" || formData.consultationType === "in-person") && (
                <>
                  <div>
                    <label className="text-sm font-medium">Scheduled Date</label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Scheduled Time</label>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConsultation}>Create Request</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarImage
                        src={
                          user?.role === "farmer"
                            ? selectedConsultation.officer?.avatar
                            : selectedConsultation.farmer?.avatar
                        }
                      />
                      <AvatarFallback>
                        {(user?.role === "farmer"
                          ? selectedConsultation.officer?.name
                          : selectedConsultation.farmer?.name
                        )?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {user?.role === "farmer"
                          ? selectedConsultation.officer?.name
                          : selectedConsultation.farmer?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConsultation.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(selectedConsultation.status)}
                    <Badge variant="outline">
                      {getTypeIcon(selectedConsultation.consultationType)}
                      <span className="ml-1 capitalize">
                        {selectedConsultation.consultationType.replace("-", " ")}
                      </span>
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConsultation(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedConsultation.description}
                </p>
              </div>

              {/* Messages */}
              <div className="mb-6">
                <h4 className="font-medium mb-4">Messages</h4>
                <ScrollArea className="h-64 border rounded-lg p-4">
                  <div className="space-y-4">
                    {selectedConsultation.messages?.map((message, index) => {
                      const isOwnMessage = message.sender?._id === user?.id;
                      return (
                        <div
                          key={index}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Send Message */}
              {selectedConsultation.status !== "completed" &&
                selectedConsultation.status !== "cancelled" && (
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  {user?.role === "officer" &&
                    selectedConsultation.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedConsultation._id, "scheduled")}
                        >
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(selectedConsultation._id, "in-progress")}
                        >
                          Start Consultation
                        </Button>
                      </>
                    )}
                  {selectedConsultation.status === "in-progress" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedConsultation._id, "completed")}
                    >
                      Complete
                    </Button>
                  )}
                </div>
                {user?.role === "farmer" &&
                  selectedConsultation.status === "completed" &&
                  !selectedConsultation.rating && (
                    <Button size="sm" variant="outline" onClick={handleSubmitFeedback}>
                      <Star className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Consultations;

