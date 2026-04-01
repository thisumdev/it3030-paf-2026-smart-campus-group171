import {
  MapPin,
  CalendarCheck,
  MessagesSquare,
  Users,
  Activity,
  Settings,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResourceAnalytics } from "../facility/services/facilityApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell,
} from "recharts";

const COLORS = ["#1e293b", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

const HOUR_LABELS = (h) => {
  if (h === 0)  return "12am";
  if (h < 12)   return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
};

const AdminDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getResourceAnalytics()
      .then((res) => setAnalytics(res.data.data))
      .catch(() => {/* silently ignore — charts just show placeholders */});
  }, []);

  const peakData = (analytics?.peakHours || []).map((h) => ({
    hour:  HOUR_LABELS(h.hour),
    count: h.bookingCount,
  }));

  const topData = (analytics?.topResources || []).map((r) => ({
    name:  r.name.length > 18 ? r.name.substring(0, 18) + "…" : r.name,
    count: r.bookingCount,
  }));

  return (
    <>
      {/* Welcome */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            System-wide metrics and facility status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
            <Activity className="h-4 w-4 mr-1.5" />
            System Healthy
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Resources — live */}
        <div
          onClick={() => navigate("/admin/facilities")}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-75 group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary-900 group-hover:scale-110 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              {analytics ? `${analytics.activeResources} Active` : "—"}
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            {analytics?.totalResources ?? "—"}
          </h3>
          <p className="text-slate-500 text-sm font-medium">Total Resources</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-150 group">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-accent-amber group-hover:scale-110 group-hover:bg-accent-amber group-hover:text-white transition-all duration-300">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Today</span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">84</h3>
          <p className="text-slate-500 text-sm font-medium">Bookings Today</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-200 group">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">+5 New</span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">17</h3>
          <p className="text-slate-500 text-sm font-medium">Open Tickets</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Active</span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">2,405</h3>
          <p className="text-slate-500 text-sm font-medium">Registered Users</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Peak Booking Hours */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-80 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up delay-400">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Peak Booking Hours</h2>
              <p className="text-xs text-slate-500 mt-0.5">Hourly booking volume</p>
            </div>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          {peakData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={peakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v) => [v, "Bookings"]}
                />
                <Line type="monotone" dataKey="count" stroke="#1e293b" strokeWidth={2.5}
                  dot={{ fill: "#1e293b", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <Activity className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-medium">No booking data yet</p>
            </div>
          )}
        </div>

        {/* Top Booked Resources */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-80 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up delay-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Booked Resources</h2>
              <p className="text-xs text-slate-500 mt-0.5">Most in-demand facilities</p>
            </div>
            <button
              onClick={() => navigate("/admin/facilities/analytics")}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {topData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v) => [v, "Bookings"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {topData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <div className="flex items-end space-x-4 h-32 px-4">
                <div className="w-12 bg-blue-200 rounded-t-sm h-16" />
                <div className="w-12 bg-primary-900 rounded-t-sm h-28 shadow-lg" />
                <div className="w-12 bg-accent-emerald rounded-t-sm h-20" />
                <div className="w-12 bg-accent-amber rounded-t-sm h-12" />
                <div className="w-12 bg-blue-300 rounded-t-sm h-24" />
              </div>
              <p className="text-slate-400 text-sm font-medium mt-4">No booking data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Resource health summary bar */}
      {analytics && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Resource Health</h2>
            <button
              onClick={() => navigate("/admin/facilities")}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "Active",          value: analytics.activeResources,       color: "bg-emerald-500" },
              { label: "Maintenance",     value: analytics.maintenanceResources,  color: "bg-amber-500"   },
              { label: "Out of Service",  value: analytics.outOfServiceResources, color: "bg-red-500"     },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${color}`} />
                <span className="text-sm text-slate-600">
                  <span className="font-bold text-slate-900">{value}</span> {label}
                </span>
              </div>
            ))}
          </div>
          {/* Visual bar */}
          <div className="mt-4 h-3 rounded-full overflow-hidden flex gap-0.5">
            {[
              { value: analytics.activeResources,       color: "bg-emerald-500" },
              { value: analytics.maintenanceResources,  color: "bg-amber-500"   },
              { value: analytics.outOfServiceResources, color: "bg-red-500"     },
            ]
              .filter((s) => s.value > 0)
              .map(({ value, color }, i) => (
                <div
                  key={i}
                  className={`${color} transition-all duration-700`}
                  style={{ flex: value }}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;