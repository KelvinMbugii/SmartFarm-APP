import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BookOpen,
  CalendarClock,
  ClipboardList,
  LifeBuoy,
  Settings,
  Star,
  AlertTriangle,
  Clock3,
  CircleCheck,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import officerService from "@/services/OfficerService";
import { toast } from "sonner";
import officerDashboardImage from "@/assets/agricultural-officer-dashboard.png";

const quickActions = [
  {
    title: "Consultation Management",
    description: "Review pending and active farmer consultations.",
    href: "/consultations",
    icon: CalendarClock,
  },
  {
    title: "Availability Settings",
    description: "Adjust booking windows, slot sizes, and limits.",
    href: "/officer-settings",
    icon: Settings,
  },
  {
    title: "Articles & Guides",
    description: "Publish draft or featured advisory articles.",
    href: "/knowledge",
    icon: BookOpen,
  },
  {
    title: "Chat Center",
    description: "Open the chat center to respond to farmer messages.",
    href: "/chat",
    icon: LifeBuoy,
  },
  {
    title: "Forum Moderation",
    description: "Resolve reports and verify community answers.",
    href: "/forums",
    icon: Bell,
  },
];

const statusTone = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  "in-progress": "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const MetricCard = ({ label, value, helper, icon }) => {
  const IconComponent = icon;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {label}
          <IconComponent className="w-4 h-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {helper ? <p className="text-xs text-muted-foreground mt-1">{helper}</p> : null}
      </CardContent>
    </Card>
  );
};

export default function OfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    kpis: {
      pendingRequests: 0,
      activeConsultations: 0,
      completedThisMonth: 0,
      averageRating: 0,
      publishedArticles: 0,
      draftArticles: 0,
      openReports: 0,
    },
    todaySchedule: [],
  });

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await officerService.getDashboardSummary();
      setSummary(data || summary);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load dashboard summary";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urgentItems = useMemo(() => {
    const items = [];
    if (summary.kpis.pendingRequests > 0) {
      items.push(`${summary.kpis.pendingRequests} pending consultation request(s)`);
    }
    if (summary.kpis.openReports > 0) {
      items.push(`${summary.kpis.openReports} open community report(s)`);
    }
    if (summary.kpis.draftArticles > 0) {
      items.push(`${summary.kpis.draftArticles} draft article(s) awaiting publish`);
    }
    return items;
  }, [summary]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">SmartFarm Officer Portal</Badge>
          <h1 className="text-3xl font-bold">Officer Dashboard</h1>
          <p className="text-muted-foreground">Operations overview for consultations, content publishing, and community moderation.</p>
        </div>
        <Button variant="outline" onClick={loadSummary} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="w-full rounded-[20px] overflow-hidden shadow-lg">
        <img
          src={officerDashboardImage}
          alt="Officer Dashboard"
          className="w-full h-48 md:h-64 object-cover"
        />
      </div>

      {error ? (
        <Card className="border-red-300">
          <CardContent className="py-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending Requests" value={summary.kpis.pendingRequests} helper="Needs officer response" icon={Clock3} />
        <MetricCard label="Active Consultations" value={summary.kpis.activeConsultations} helper="Pending + scheduled + in-progress" icon={CalendarClock} />
        <MetricCard label="Completed (This Month)" value={summary.kpis.completedThisMonth} helper="Closed consultations this month" icon={CircleCheck} />
        <MetricCard label="Average Rating" value={summary.kpis.averageRating || "-"} helper="Farmer feedback quality" icon={Star} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5" />Today’s Priority Queue</CardTitle>
            <CardDescription>Consultations for today, ordered by scheduled time.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading schedule...</p>
            ) : summary.todaySchedule?.length ? (
              <div className="space-y-3">
                {summary.todaySchedule.map((item) => (
                  <div key={item._id} className="border rounded-md p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">Farmer: {item.farmer?.name || "Unknown"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.scheduledTime || "--:--"}</p>
                      <span className={`inline-flex mt-1 px-2 py-1 rounded-md border text-xs ${statusTone[item.status] || "bg-muted"}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No consultations scheduled for today.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Attention Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {urgentItems.length === 0 ? (
              <p className="text-muted-foreground">No urgent actions right now. Great work!</p>
            ) : (
              urgentItems.map((item) => (
                <div key={item} className="rounded-md bg-amber-50 border border-amber-200 p-2">
                  {item}
                </div>
              ))
            )}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Published: <span className="font-semibold">{summary.kpis.publishedArticles}</span> · Drafts: <span className="font-semibold">{summary.kpis.draftArticles}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5 text-blue-600" />{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={module.href}>
                    Open {module.title}
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}