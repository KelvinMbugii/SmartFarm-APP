import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TrendingUp, MessageSquare, Users, DollarSign } from "lucide-react";
import ConsultationRoom from "../components/ConsultationRoom";

export default function AgripreneurDashboard({ userProfile }) {
  const [showConsultation, setShowConsultation] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Agripreneur Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile.name}! Manage your agricultural business
          operations.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Connected partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Business Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Business Activities</CardTitle>
            <CardDescription>
              Track your business operations and deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  activity: "Supply Chain Partnership",
                  date: "Today, 10:00 AM",
                  status: "In Progress",
                },
                {
                  activity: "Market Analysis Report",
                  date: "Yesterday, 3:00 PM",
                  status: "Completed",
                },
                {
                  activity: "Investment Proposal Review",
                  date: "2 days ago",
                  status: "Completed",
                },
                {
                  activity: "Farmer Network Meeting",
                  date: "3 days ago",
                  status: "Scheduled",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.activity}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      item.status === "Completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : item.status === "In Progress"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access key features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gap-2"
              variant="outline"
              onClick={() => setShowConsultation(true)}
            >
              <MessageSquare className="h-4 w-4" />
              Start Consultation
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Users className="h-4 w-4" />
              View Network
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <TrendingUp className="h-4 w-4" />
              Market Insights
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <DollarSign className="h-4 w-4" />
              Financial Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Room Modal */}
      {showConsultation && (
        <ConsultationRoom
          userProfile={userProfile}
          onClose={() => setShowConsultation(false)}
        />
      )}
    </div>
  );
}
