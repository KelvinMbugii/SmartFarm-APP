// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function AdminDashboard(){
//     const [ user, setUser ] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem("token");

//         if(!token) {
//             navigate("/login");
//             return;
//         }

//         fetch("http://localhost:5000/api/auth/me", {
//             headers: { Authorization: `Bearer ${token}`}
//         })
//          .then(res => res.json())
//          .then(data => {
//             if (data.role !== "admin"){
//                 navigate("/")
//             }else {
//                 setUser(data);
//             }
//          });
//     }, [navigate]);

//     if (!user) return <p>Loading...</p>;

//     return (
//         <div>
//             <h1>Welcome, {user.email}</h1>
//             <h2>Admin Dashboard</h2>
//             <p>Here you can Manage users and view activities</p>
//         </div>
//     );
// }



import React, { useEffect, useState, useCallback } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  MdRefresh,
  MdDeviceHub,
  MdOutlineWarningAmber,
  MdAnalytics,
} from "react-icons/md";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * IT Dashboard (focused, modular, step-by-step ready)
 *
 * - Overview card area
 * - Sensor trends (line)
 * - Device distribution (doughnut)
 * - Alerts table
 * - Auto-refresh toggle + manual refresh
 *
 * Next small step suggestions: "devices controls", "chart tooltip improvements",
 * "add server health card", "export CSV".
 */

export default function ITDashboard() {
  const [overview, setOverview] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshIntervalMs] = useState(30_000); // 30s default

  const token = localStorage.getItem("token") || "";

  const fetchAll = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [ovRes, devRes, alertsRes, analyticsRes] = await Promise.all([
          fetch(`${API_BASE}/it-dashboard/overview`, { headers }),
          fetch(`${API_BASE}/it-dashboard/devices`, { headers }),
          fetch(`${API_BASE}/it-dashboard/security-alerts?limit=20`, {
            headers,
          }),
          fetch(`${API_BASE}/it-dashboard/analytics?range=7d`, { headers }),
        ]);

        // Try to parse; each endpoint returns JSON shaped { success: true, data: ... } or similar
        const ovJson = ovRes.ok ? await ovRes.json() : null;
        const devJson = devRes.ok ? await devRes.json() : null;
        const alertsJson = alertsRes.ok ? await alertsRes.json() : null;
        const analyticsJson = analyticsRes.ok
          ? await analyticsRes.json()
          : null;

        if (!ovRes.ok) throw new Error(`Overview failed (${ovRes.status})`);
        if (!devRes.ok) throw new Error(`Devices failed (${devRes.status})`);
        if (!alertsRes.ok)
          throw new Error(`Alerts failed (${alertsRes.status})`);
        if (!analyticsRes.ok)
          throw new Error(`Analytics failed (${analyticsRes.status})`);

        setOverview(ovJson.data || ovJson); // support both shapes
        setDevices(devJson.data?.devices ?? devJson.data ?? []);
        setAlerts(alertsJson.data?.alerts ?? alertsJson.data ?? []);
        setAnalytics(analyticsJson.data ?? analyticsJson);
      } catch (err) {
        console.error("ITDashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Initial load
  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchAll(false), refreshIntervalMs);
    return () => clearInterval(id);
  }, [autoRefresh, fetchAll, refreshIntervalMs]);

  // Simple refresh handler
  const handleRefresh = async () => fetchAll(true);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Loading IT Dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Chart data builders (safe defaults)
  const lineData = {
    labels: analytics?.timeLabels ?? [],
    datasets: [
      {
        label: "Soil Moisture (%)",
        data: analytics?.soilMoisture ?? [],
        borderColor: "#10B981",
        tension: 0.3,
        fill: false,
      },
      {
        label: "Temperature (°C)",
        data: analytics?.temperature ?? [],
        borderColor: "#3B82F6",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const deviceDoughnut = {
    labels: ["Active", "Inactive", "Error"],
    datasets: [
      {
        data: [
          overview?.activeDevices ??
            devices.filter((d) => d.status === "active").length,
          overview?.inactiveDevices ??
            devices.filter((d) => d.status === "inactive").length,
          overview?.errorDevices ??
            devices.filter((d) => d.status === "faulty").length,
        ],
        backgroundColor: ["#10B981", "#9CA3AF", "#EF4444"],
      },
    ],
  };

  // --- Simple subcomponents (extract later if you want)
  function MetricCard({ title, value, icon }) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center gap-4">
        <div className="p-2 rounded-md bg-gray-100 text-2xl">{icon}</div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-xl font-semibold text-gray-800">{value}</div>
        </div>
      </div>
    );
  }

  function AlertsTable({ items = [] }) {
    if (!items.length) {
      return <div className="text-sm text-gray-500 p-4">No active alerts</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">
                  {a.category ?? a.type ?? "system"}
                </td>
                <td className="p-3 text-gray-600">{a.message}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      a.severity === "high"
                        ? "bg-red-100 text-red-700"
                        : a.severity === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {a.severity ?? "low"}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(a.detectedAt ?? a.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --- Layout render
  return (
    <div className="space-y-6">
      {/* header / controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">IT Dashboard</h2>
          <p className="text-sm text-gray-500">
            Monitoring · Devices · Alerts · Analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="form-checkbox h-4 w-4"
            />
            Auto-refresh
          </label>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Refresh now"
          >
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Devices"
          value={overview?.activeDevices ?? 0}
          icon={<MdDeviceHub />}
        />
        <MetricCard
          title="Active Alerts"
          value={alerts.length}
          icon={<MdOutlineWarningAmber />}
        />
        <MetricCard
          title="System Uptime"
          value={overview?.uptime ?? "unknown"}
          icon={<MdAnalytics />}
        />
        <MetricCard
          title="Data Rate"
          value={overview?.dataRate ?? "—"}
          icon={<span>📶</span>}
        />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Sensor trends (7d)
          </h3>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Device status
          </h3>
          <Doughnut data={deviceDoughnut} />
          <div className="mt-3 text-xs text-gray-500">
            Active: {overview?.activeDevices ?? 0} · Inactive:{" "}
            {overview?.inactiveDevices ?? 0} · Errors:{" "}
            {overview?.errorDevices ?? 0}
          </div>
        </div>
      </div>

      {/* alerts */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            Security & system alerts
          </h3>
        </div>
        <AlertsTable items={alerts} />
      </div>
    </div>
  );
}
