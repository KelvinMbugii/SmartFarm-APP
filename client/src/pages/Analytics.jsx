import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

/* --------------------------- Reusable Card --------------------------- */

function AnalyticsCard({ title, value, description, icon: Icon }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <Icon className="h-5 w-5 text-amber-600" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ----------------------------- Main Page ----------------------------- */

export default function Analytics() {
  const [overview, setOverview] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewRes, usersRes, postsRes] = await Promise.all([
        api.get("/api/admin/overview"),
        api.get("/api/admin/users"),
        api.get("/api/admin/posts"),
      ]);

      setOverview(overviewRes.data || {});
      setUsers(usersRes.data || []);
      setPosts(postsRes.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Failed to load analytics. Please try refreshing.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totals = overview?.totals || {};

  /* --------------------------- Derived Data -------------------------- */

  const roleDistribution = useMemo(() => {
    const counts = users.reduce((acc, user) => {
      const role = user?.role || "unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => ({ role, count }));
  }, [users]);

  const moderationStats = useMemo(() => {
    const reported = posts.filter(
      (post) => Number(post?.openReports) > 0,
    ).length;

    const pinned = posts.filter((post) => post?.pinned).length;

    return { reported, pinned };
  }, [posts]);

  /* ----------------------------- Cards ------------------------------- */

  const analyticsCards = [
    {
      title: "Total Accounts",
      value: totals.users ?? users.length,
      description: `${totals.activeUsers ?? 0} active users`,
      icon: Users,
    },
    {
      title: "Online Right Now",
      value: totals.onlineUsers ?? 0,
      description: "Live active sessions across the platform",
      icon: Activity,
    },
    {
      title: "Forum Posts",
      value: totals.posts ?? posts.length,
      description: `${moderationStats.pinned} pinned posts`,
      icon: BarChart3,
    },
    {
      title: "Moderation Risk",
      value: totals.openReports ?? moderationStats.reported,
      description: "Posts with active reports",
      icon: AlertTriangle,
    },
  ];

  /* ----------------------------- States ------------------------------ */

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  /* ----------------------------- Render ------------------------------ */

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Admin Insights
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Track account growth, moderation health, and engagement signals.
          </p>
        </div>

        <Button onClick={fetchAnalytics} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh Analytics
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsCards.map((card) => (
          <AnalyticsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>
              Breakdown of platform users by role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roleDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No user data found.
              </p>
            ) : (
              roleDistribution.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between border-b pb-2 text-sm"
                >
                  <span className="capitalize text-muted-foreground">
                    {item.role}
                  </span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Moderation */}
        <Card>
          <CardHeader>
            <CardTitle>Moderation Status</CardTitle>
            <CardDescription>
              Overview of reported posts and safety posture.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Reported Posts</span>
              <Badge
                variant={
                  moderationStats.reported > 0 ? "destructive" : "secondary"
                }
              >
                {moderationStats.reported}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Pinned Posts</span>
              <span className="font-semibold">{moderationStats.pinned}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Safety Indicator</span>
              <div className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">
                  {moderationStats.reported === 0 ? "Healthy" : "Needs Review"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
