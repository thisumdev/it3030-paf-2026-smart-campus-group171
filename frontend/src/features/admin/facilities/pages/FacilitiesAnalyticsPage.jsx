import { useState, useEffect } from "react";
import { getResourceAnalytics } from "../services/facilityApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Loader2, AlertCircle, TrendingUp, MapPin, Wrench, XCircle, Activity } from "lucide-react";

const COLORS = ["#1e293b", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

const HOUR_LABELS = (h) => {
  if (h === 0)  return "12am";
  if (h < 12)   return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
};

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB:          "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT:    "Equipment",
};

const FacilitiesAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getResourceAnalytics();
        setAnalytics(res.data.data);
      } catch {
        setError("Failed to load analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const peakData = (analytics?.peakHours || []).map((h) => ({
    hour:  HOUR_LABELS(h.hour),
    count: h.bookingCount,
  }));

  const topData = (analytics?.topResources || []).map((r) => ({
    name:  r.name.length > 20 ? r.name.substring(0, 20) + "…" : r.name,
    count: r.bookingCount,
    type:  TYPE_LABELS[r.type] || r.type,
  }));

  const pieData = Object.entries(analytics?.countByType || {}).map(([type, count]) => ({
    name:  TYPE_LABELS[type] || type,
    value: count,
  }));

  const statCards = [
    { label: "Total Resources",     value: analytics?.totalResources      ?? 0, icon: MapPin,    color: "bg-blue-50 text-blue-600"    },
    { label: "Active",              value: analytics?.activeResources      ?? 0, icon: Activity,  color: "bg-emerald-50 text-emerald-600" },
    { label: "Under Maintenance",   value: analytics?.maintenanceResources ?? 0, icon: Wrench,    color: "bg-amber-50 text-amber-600"  },
    { label: "Out of Service",      value: analytics?.outOfServiceResources ?? 0, icon: XCircle,  color: "bg-red-50 text-red-600"      },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900">Usage Analytics</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Insights into resource utilisation, peak demand and facility health.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-slide-up">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Peak Booking Hours */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Peak Booking Hours</h2>
              <p className="text-xs text-slate-500 mt-0.5">Booking volume by hour by day</p>
            </div>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          {peakData.length === 0 ? (
            <EmptyChart message="No booking data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={peakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [v, "Bookings"]} />
                <Line type="monotone" dataKey="count" stroke="#1e293b" strokeWidth={2.5} dot={{ fill: "#1e293b", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Booked Resources */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Booked Resources</h2>
              <p className="text-xs text-slate-500 mt-0.5">Top 5 most booked facilities</p>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          {topData.length === 0 ? (
            <EmptyChart message="No booking data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [v, "Bookings"]} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie + Detail Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <h2 className="text-base font-bold text-slate-900 mb-5">Resources by Type</h2>
          {pieData.length === 0 ? (
            <EmptyChart message="No resources found" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <h2 className="text-base font-bold text-slate-900 mb-5">Top Resources — Detail</h2>
          {topData.length === 0 ? (
            <EmptyChart message="No booking data yet" />
          ) : (
            <div className="space-y-3">
              {analytics.topResources.map((r, i) => (
                <div key={r.resourceId} className="flex items-center gap-4">
                  <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{r.name}</p>
                    <p className="text-xs text-slate-500">{TYPE_LABELS[r.type] || r.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{r.bookingCount}</p>
                    <p className="text-xs text-slate-500">bookings</p>
                  </div>
                  <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, (r.bookingCount / (analytics.topResources[0]?.bookingCount || 1)) * 100)}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const EmptyChart = ({ message }) => (
  <div className="h-48 flex flex-col items-center justify-center text-slate-400">
    <Activity className="h-8 w-8 mb-2 opacity-40" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default FacilitiesAnalyticsPage;