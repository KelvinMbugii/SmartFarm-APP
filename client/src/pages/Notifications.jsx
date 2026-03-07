import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Bell,
  Users,
  Search,
  MessageCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useSocket } from "@/contexts/SocketContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Mock data for easy debugging when API fails
const MOCK_ONLINE_USERS = [
  { id: "1", name: "John Kamau", role: "farmer", isOnline: true, lastSeen: new Date() },
  { id: "2", name: "Mary Wanjiku", role: "farmer", isOnline: true, lastSeen: new Date() },
  { id: "3", name: "Officer Peter", role: "officer", isOnline: true, lastSeen: new Date() },
  { id: "4", name: "Grace Muthoni", role: "farmer", isOnline: true, lastSeen: new Date() },
  { id: "5", name: "David Ochieng", role: "agripreneur", isOnline: false, lastSeen: new Date(Date.now() - 3600000) },
];

const MOCK_ACTIVITY_DATA = [
  { day: "Mon", consultations: 4, orders: 12, messages: 8 },
  { day: "Tue", consultations: 6, orders: 15, messages: 11 },
  { day: "Wed", consultations: 3, orders: 9, messages: 6 },
  { day: "Thu", consultations: 8, orders: 18, messages: 14 },
  { day: "Fri", consultations: 5, orders: 14, messages: 9 },
  { day: "Sat", consultations: 2, orders: 7, messages: 4 },
  { day: "Sun", consultations: 1, orders: 4, messages: 3 },
];

const MOCK_ROLE_DISTRIBUTION = [
  { name: "Farmers", value: 45, color: "#22c55e" },
  { name: "Officers", value: 12, color: "#3b82f6" },
  { name: "Agripreneurs", value: 18, color: "#8b5cf6" },
  { name: "Admins", value: 3, color: "#f59e0b" },
];

export default function Notifications() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`${API_BASE.replace(/\/$/, "")}/api/users/online`);
        const users = Array.isArray(data) ? data : [];
        // Endpoint returns online users only; normalize fields
        setOnlineUsers(
          users.map((u) => ({
            ...u,
            id: u._id || u.id,
            isOnline: true,
            lastSeen: u.lastSeen ? new Date(u.lastSeen) : new Date(),
          }))
        );
        setUseMock(false);

        // Activity and role charts are mock for now (debug-friendly)
        setActivityData(MOCK_ACTIVITY_DATA);
        setRoleData(MOCK_ROLE_DISTRIBUTION);
      } catch (e) {
        setOnlineUsers(MOCK_ONLINE_USERS);
        setActivityData(MOCK_ACTIVITY_DATA);
        setRoleData(MOCK_ROLE_DISTRIBUTION);
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real-time online users via Socket.IO presence
  useEffect(() => {
    if (!socket) return;
    const onOnlineUsers = (users) => {
      if (!Array.isArray(users)) return;
      setOnlineUsers(
        users.map((u) => ({
          ...u,
          id: u._id || u.id,
          isOnline: true,
          lastSeen: u.lastSeen ? new Date(u.lastSeen) : new Date(),
        }))
      );
      setUseMock(false);
    };

    socket.on("presence:online-users", onOnlineUsers);
    socket.emit("presence:request");

    return () => {
      socket.off("presence:online-users", onOnlineUsers);
    };
  }, [socket]);

  const filteredUsers = onlineUsers.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineCount = filteredUsers.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications & Activity</h1>
          <p className="text-muted-foreground mt-1">
            See who's online and track your SmartFarm activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Live" : "Offline"}
          </Badge>
          {useMock && (
            <Badge variant="secondary" className="w-fit">
              Using mock data for debugging
            </Badge>
          )}
        </div>
      </div>

      {/* Online Users */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Online Users
              </CardTitle>
              <CardDescription>{onlineCount} users currently online</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No users found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id || u._id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>
                      {(u.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{u.name || "Unknown"}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {u.role || "user"}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Online
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Consultations, orders, and messages over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="consultations" fill="#22c55e" name="Consultations" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="messages" fill="#8b5cf6" name="Messages" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>Active users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, "Users"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trend Line */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Trend</CardTitle>
          <CardDescription>Combined activity over the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData.map((d) => ({
                  ...d,
                  total: d.consultations + d.orders + d.messages,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                  name="Total Activity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
