import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  Users,
  Tractor,
  CloudSun,
  Activity,
} from "lucide-react";

const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalChats: 0,
    activeListings: 0,
    marketAlerts: 0,
    connections: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    // Example: Fetch from API later
    setStats({
      totalChats: 12,
      activeListings: 5,
      marketAlerts: 3,
      connections: 28,
    });
  };

  const quickActions = [
    {
      label: "Start Chat",
      icon: MessageCircle,
      href: "/chat",
      color: "bg-blue-500",
    },
    {
      label: "Browse Equipment",
      icon: ShoppingCart,
      href: "/marketplace",
      color: "bg-green-500",
    },
    {
      label: "Check Weather",
      icon: CloudSun,
      href: "/weather",
      color: "bg-yellow-500",
    },
    {
      label: "Market Prices",
      icon: TrendingUp,
      href: "/market",
      color: "bg-purple-500",
    },
  ];

  const recentActivity = [
    { id: 1, content: "New message from John Doe", time: "2 minutes ago" },
    { id: 2, content: "Rice price increased by 5%", time: "1 hour ago" },
    { id: 3, content: "New tractor listing available", time: "3 hours ago" },
    { id: 4, content: "Rain expected tomorrow", time: "5 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name || "Farmer"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here’s what’s happening on your farm today.
          </p>
        </div>
        <Badge variant="secondary">
          {user?.role === "farmer" ? "Farmer" : "Agricultural Officer"}
        </Badge>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Active Chats",
            value: stats.totalChats,
            icon: MessageCircle,
          },
          {
            title: "Equipment Listings",
            value: stats.activeListings,
            icon: Tractor,
          },
          {
            title: "Market Alerts",
            value: stats.marketAlerts,
            icon: TrendingUp,
          },
          { title: "Connections", value: stats.connections, icon: Users },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(({ label, icon: Icon, color, href }) => (
              <Button
                key={label}
                variant="outline"
                className="h-20 flex flex-col justify-center"
                onClick={() => navigate(href)}
              >
                <div className={`p-2 rounded-full ${color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm mt-1">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50 mb-2"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.content}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;