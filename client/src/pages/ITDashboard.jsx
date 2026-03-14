import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/services/api";
import {
  Activity,
  BarChart3,
  Pin,
  RefreshCcw,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useLocation } from "react-router-dom";

function MetricCard({ title, value, helper, icon: Icon }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {helper ? (
              <p className="text-xs text-muted-foreground mt-1">{helper}</p>
            ) : null}
          </div>
          <Icon className="h-5 w-5 text-amber-600" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ITDashboard() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const usersSectionRef = useRef(null);
  const postsSectionRef = useRef(null);

  const fetchDashboard = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const [overviewRes, usersRes, postsRes] = await Promise.all([
        api.get("/api/admin/overview"),
        api.get("/api/admin/users"),
        api.get("/api/admin/posts"),
      ]);

      setOverview(overviewRes.data);
      setUsers(usersRes.data || []);
      setPosts(postsRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to load admin dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view");

    if (view === "users") {
      usersSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    if (view === "posts") {
      postsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.search]);

  const handleToggleUser = async (userId, nextStatus) => {
    try {
      await api.patch(`/api/admin/users/${userId}/status`, {
        isActive: nextStatus,
      });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: nextStatus,
                deactivatedAt: nextStatus ? null : new Date().toISOString(),
              }
            : user,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update user status.");
    }
  };

  const handlePinPost = async (postId, pinned) => {
    try {
      await api.patch(`/api/admin/posts/${postId}/pin`, { pinned });
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, pinned } : post)),
      );
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update post status.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/admin/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete post.");
    }
  };

  const metrics = useMemo(() => {
    const totals = overview?.totals || {};
    return [
      {
        title: "Total Users",
        value: totals.users ?? 0,
        helper: `${totals.activeUsers ?? 0} active accounts`,
        icon: Users,
      },
      {
        title: "System Health",
        value: `${totals.onlineUsers ?? 0} online`,
        helper: `${totals.deactivatedUsers ?? 0} deactivated accounts`,
        icon: Activity,
      },
      {
        title: "Forum Posts",
        value: totals.posts ?? 0,
        helper: `${totals.pinnedPosts ?? 0} pinned`,
        icon: BarChart3,
      },
      {
        title: "Moderation Alerts",
        value: totals.openReports ?? 0,
        helper: "Open reports requiring admin review",
        icon: Shield,
      },
    ];
  }, [overview]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Admin Control Center
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">
            Platform Administration Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor system health analytics, manage users, and moderate
            community posts.
          </p>
        </div>
        <Button onClick={fetchDashboard} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div ref={usersSectionRef}>
        <Card>
          <CardHeader>
            <CardTitle>User Account Management</CardTitle>
            <CardDescription>
              Activate, deactivate, and monitor platform users.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 15).map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-3 pr-4 font-medium">{user.name}</td>
                    <td className="py-3 pr-4 capitalize">{user.role}</td>
                    <td className="py-3 pr-4">{user.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Deactivated"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {user.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleToggleUser(user._id, false)}
                        >
                          <UserX className="h-4 w-4" /> Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleToggleUser(user._id, true)}
                        >
                          <UserCheck className="h-4 w-4" /> Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div ref={postsSectionRef}>
        <Card>
          <CardHeader>
            <CardTitle>Post Moderation</CardTitle>
            <CardDescription>
              Pin key posts or remove harmful content from forums.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4">Title</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Author</th>
                  <th className="py-3 pr-4">Reports</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.slice(0, 15).map((post) => (
                  <tr key={post._id} className="border-b">
                    <td className="py-3 pr-4 font-medium">{post.title}</td>
                    <td className="py-3 pr-4 capitalize">{post.category}</td>
                    <td className="py-3 pr-4">
                      {post.author?.name || "Unknown"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          post.openReports > 0 ? "destructive" : "secondary"
                        }
                      >
                        {post.openReports} open
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handlePinPost(post._id, !post.pinned)}
                        >
                          <Pin className="h-4 w-4" />{" "}
                          {post.pinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
