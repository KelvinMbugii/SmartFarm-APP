import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingCart, TrendingUp, Users, Tractor, CloudSun, Activity, DollarSign, } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalChats: 0,
    activeListings: 0,
    marketAlerts: 0,
    connections: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    // Mock data for now
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
    {
      id: 1,
      type: "message",
      content: "New message from John Doe",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "price",
      content: "Rice price increased by 5%",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "equipment",
      content: "New tractor listing available",
      time: "3 hours ago",
    },
    {
      id: 4,
      type: "weather",
      content: "Rain expected tomorrow",
      time: "5 hours ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening on your farm today
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {user?.role === "farmer" ? "Farmer" : "Agricultural Officer"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChats}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipment Listings
            </CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">3 pending approval</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Alerts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.marketAlerts}</div>
            <p className="text-xs text-muted-foreground">2 price changes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connections}</div>
            <p className="text-xs text-muted-foreground">+4 this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <div className={`p-2 rounded-full ${action.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.content}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <CloudSun className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">25°C</p>
                <p className="text-sm text-muted-foreground">Partly cloudy</p>
                <p className="text-xs text-muted-foreground">Humidity: 65%</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm">
                <span className="font-medium">Recommendation:</span> Good
                conditions for field work
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
