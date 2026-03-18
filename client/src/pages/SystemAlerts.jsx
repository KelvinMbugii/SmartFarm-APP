import { useCallback, useEffect, useMemo, useState } from "react";
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
import { AlertTriangle, BellRing, RefreshCcw, ShieldAlert } from "lucide-react";

const severityVariant = {
  critical: "destructive",
  warning: "secondary",
  info: "outline",
};

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    critical: 0,
    warning: 0,
    info: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/admin/alerts");
      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      setSummary(
        data.summary || {
          critical: 0,
          warning: 0,
          info: 0,
          total: 0,
        },
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load system alerts.");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const groupedAlerts = useMemo(() => {
    const base = { critical: [], warning: [], info: [] };
    alerts.forEach((alert) => {
      const level = alert.severity || "info";
      if (!base[level]) base[level] = [];
      base[level].push(alert);
    });
    return base;
  }, [alerts]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Admin Monitoring
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">System Alerts</h1>
          <p className="text-muted-foreground">
            Centralized alert feed for moderation, marketplace, and platform risks.
          </p>
        </div>
        <Button onClick={fetchAlerts} disabled={loading} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Refresh Alerts
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Alerts</p>
            <p className="text-2xl font-bold">{summary.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{summary.critical || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="text-2xl font-bold text-amber-600">{summary.warning || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Info</p>
            <p className="text-2xl font-bold text-blue-600">{summary.info || 0}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Loading alerts...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {["critical", "warning", "info"].map((severity) => (
            <Card key={severity}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {severity === "critical" ? (
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  ) : severity === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <BellRing className="h-5 w-5 text-blue-600" />
                  )}
                  {severity} alerts
                </CardTitle>
                <CardDescription>
                  {groupedAlerts[severity]?.length || 0} alert(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(groupedAlerts[severity] || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No alerts.</p>
                ) : (
                  groupedAlerts[severity].map((alert, index) => (
                    <div key={`${alert.type}-${index}`} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{alert.title}</p>
                        <Badge variant={severityVariant[alert.severity] || "outline"}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Source: {alert.type}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}