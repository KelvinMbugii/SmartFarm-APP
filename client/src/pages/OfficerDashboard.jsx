import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Users, MessageSquare, FileText, AlertCircle } from "lucide-react";
import { useGetActiveConsultations } from "../hooks/useQueries";
import ConsultationRoom from "../components/ConsultationRoom";

export default function OfficerDashboard({ userProfile }) {
  const [showConsultation, setShowConsultation] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const { data: consultations = [], isLoading } = useGetActiveConsultations();

  const handleOpenConsultation = (consultationId) => {
    setSelectedConsultationId(consultationId);
    setShowConsultation(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Agricultural Officer Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile.name}! Manage consultations and support
          users.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">+18 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultations.length}</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Consultations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Consultations</CardTitle>
            <CardDescription>
              Manage and respond to user consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading consultations...
                </p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No active consultations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        Consultation #{consultation.id.slice(-8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.participants.length} participant(s)
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenConsultation(consultation.id)}
                    >
                      Open Chat
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Administrative tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gap-2"
              variant="outline"
              onClick={() => setShowConsultation(true)}
            >
              <MessageSquare className="h-4 w-4" />
              New Consultation
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Users className="h-4 w-4" />
              View All Users
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <AlertCircle className="h-4 w-4" />
              View Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Room Modal */}
      {showConsultation && (
        <ConsultationRoom
          userProfile={userProfile}
          consultationId={selectedConsultationId}
          onClose={() => {
            setShowConsultation(false);
            setSelectedConsultationId(null);
          }}
        />
      )}
    </div>
  );
}
