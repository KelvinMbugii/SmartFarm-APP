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
      color: "bg-primary",
    },
    {
      label: "Browse Equipment",
      icon: ShoppingCart,
      href: "/marketplace",
      color: "bg-secondary",
    },
    {
      label: "Check Weather",
      icon: CloudSun,
      href: "/weather",
      color: "bg-accent",
    },
    {
      label: "Market Prices",
      icon: TrendingUp,
      href: "/market",
      color: "bg-primary/80",
    },
  ];

  const recentActivity = [
    { id: 1, content: "New message from John Doe", time: "2 minutes ago" },
    { id: 2, content: "Rice price increased by 5%", time: "1 hour ago" },
    { id: 3, content: "New tractor listing available", time: "3 hours ago" },
    { id: 4, content: "Rain expected tomorrow", time: "5 hours ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary font-heading">
            Welcome back, {user?.name || "Farmer"}
          </h1>
          <p className="text-muted-foreground mt-1 font-body">
            Here is what is happening on your farm today.
          </p>
        </div>
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
          {user?.role === "farmer" ? "Farmer" : "Agricultural Officer"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Active Chats",
            value: stats.totalChats,
            icon: MessageCircle,
            bgColor: "bg-primary/10",
          },
          {
            title: "Equipment Listings",
            value: stats.activeListings,
            icon: Tractor,
            bgColor: "bg-secondary/20",
          },
          {
            title: "Market Alerts",
            value: stats.marketAlerts,
            icon: TrendingUp,
            bgColor: "bg-accent/20",
          },
          { 
            title: "Connections", 
            value: stats.connections, 
            icon: Users,
            bgColor: "bg-primary/10",
          },
        ].map((item) => (
          <Card key={item.title} className="card-shadow card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-heading">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="font-heading">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(({ label, icon: Icon, color, href }) => (
              <Button
                key={label}
                variant="outline"
                className="h-24 flex flex-col justify-center gap-2 border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all duration-300"
                onClick={() => navigate(href)}
              >
                <div className={`p-3 rounded-full ${color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium font-heading">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="font-heading">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50 mb-2 hover:bg-muted/70 transition-colors"
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
