import { useCallback, useMemo, useState, useEffect } from "react";
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
import { Bell, CheckCheck, MessageCircle, Search, Users} from "lucide-react";
import api from "@/services/api";
import { useSocket } from "@/contexts/SocketContext";

function formatRelative(dateString){
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

 if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
}

export default function Notifications() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: listData }, { data: usersData }] = await Promise.all([
        api.get("/api/notifications", { params: { limit: 20 } }),
        api.get("/api/users/online"),
      ]);

      setNotifications(
        Array.isArray(listData.notifications) ? listData.notifications : [],
      );
      setNextCursor(listData.nextCursor || null);
      setOnlineUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      setNotifications([]);
      setOnlineUsers([]);
    } finally {
      setLoading(false);
    }

  }, []);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const { data } = await api.get("/api/notifications", {
        params: { limit: 20, cursor: nextCursor },
      });

      setNotifications((prev) => [
        ...prev,
        ...(Array.isArray(data.notifications) ? data.notifications : []),
      ]);
      setNextCursor(data.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  // Real-time online users via Socket.IO presence
  useEffect(() => {
    if (!socket) return;
    const onOnlineUsers = (users) => {
       if (Array.isArray(users)) setOnlineUsers(users);
    };

    const onNewNotification = (notification) => {
      if (!notification?._id) return;
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("presence:online-users", onOnlineUsers);
    socket.on("notification:new", onNewNotification)
    socket.emit("presence:request");

    return () => {
      socket.off("presence:online-users", onOnlineUsers);
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification,
        ),
      );
    } catch (error) {
      // no-op
    }
  };

 const markAllAsRead = async () => {
   try {
     await api.patch("/api/notifications/read-all");
     setNotifications((prev) =>
       prev.map((notification) => ({
         ...notification,
         read: true,
         readAt: notification.readAt || new Date().toISOString(),
       })),
     );
   } catch (error) {
     // no-op
   }
 };

 const filteredOnlineUsers = onlineUsers.filter((user) => {
   const term = searchTerm.trim().toLowerCase();
   if (!term) return true;
   return (
     String(user?.name || "")
       .toLowerCase()
       .includes(term) ||
     String(user?.role || "")
       .toLowerCase()
       .includes(term)
   );
 });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            Realtime inbox and online community activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Live" : "Offline"}
          </Badge>
          <Badge variant={unreadCount > 0 ? "default" : "outline"}>
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Inbox
            </CardTitle>
            <CardDescription>
              Your in-app notifications are stored here.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={!notifications.length || unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-lg border p-4 transition ${
                    notification.read ? "bg-card" : "bg-muted/40"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read && <Badge>New</Badge>}
                        <Badge variant="outline" className="capitalize">
                          {notification.type || "system"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelative(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {nextCursor && (
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={loadingMore}
                  className="w-full"
                >
                  {loadingMore ? "Loading..." : "Load older notifications"}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Online Users */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Online Users
              </CardTitle>
              <CardDescription>
                {filteredOnlineUsers.length} users currently online
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOnlineUsers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No online users found
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredOnlineUsers.map((user) => (
                <div
                  key={user._id || user.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {(user.name || "U")
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {user.name || "Unknown"}

                    </p>
                      
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.role || "user"}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
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
    </div>
  );
}
