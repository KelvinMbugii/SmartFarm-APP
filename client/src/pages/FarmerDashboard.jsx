import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sprout, MessageSquare, BookOpen, TrendingUp } from "lucide-react";
import ConsultationRoom from "../components/ConsultationRoom";

export default function FarmerDashboard({ userProfile }) {
  const [showConsultation, setShowConsultation] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Farmer Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {userProfile.name}! Manage your farming activities and
          resources.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Available guides</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15%</div>
            <p className="text-xs text-muted-foreground">vs last season</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Farming Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Farming Activities</CardTitle>
            <CardDescription>
              Track your daily farming operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  activity: "Wheat Field Irrigation",
                  date: "Today, 8:00 AM",
                  status: "Completed",
                },
                {
                  activity: "Corn Crop Inspection",
                  date: "Yesterday, 2:30 PM",
                  status: "Completed",
                },
                {
                  activity: "Fertilizer Application",
                  date: "2 days ago",
                  status: "Completed",
                },
                {
                  activity: "Pest Control Treatment",
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
              <BookOpen className="h-4 w-4" />
              View Resources
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Sprout className="h-4 w-4" />
              Add Crop Activity
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <TrendingUp className="h-4 w-4" />
              View Analytics
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
