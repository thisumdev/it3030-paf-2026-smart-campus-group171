import { useState, useEffect } from "react";
import { getBookingAnalytics, downloadDailyReport } from "../../../../api/bookingApi";
import {
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
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Download,
} from "lucide-react";

const COLORS = ["#1e293b", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

const STATUS_COLORS = {
  APPROVED:       "#10b981",
  PENDING:        "#f59e0b",
  REJECTED:       "#ef4444",
  CANCELLED:      "#94a3b8",
  AUTO_CANCELLED: "#dc2626",
};

const formatStatusLabel = (status) =>
  String(status).replace(/_/g, " ");

const initialsFromName = (name) => {
  if (!name || !String(name).trim()) return "?";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(name).slice(0, 2).toUpperCase();
};

const cancellationBadgeClass = (rate) => {
  const r = Number(rate) || 0;
  if (r <= 20) return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (r <= 50) return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-red-100 text-red-700 border border-red-200";
};

const BookingAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getBookingAnalytics();
        const data = res.data.data || res.data;
        setAnalytics(data);
        console.log('Full analytics keys:', Object.keys(data));
        console.log('Full analytics:', JSON.stringify(data, null, 2));
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

  const pieData = Object.entries(analytics?.statusBreakdown || {}).map(([status, count]) => ({
    name:  formatStatusLabel(status),
    value: count,
    statusKey: status,
  }));

  const barDayData = (analytics?.bookingsByDay || []).map((d) => ({
    day:   d.day,
    count: d.count,
  }));

  const totalApproved = analytics?.totalApprovedBookings ?? 0;
  const checkedIn     = analytics?.checkedInCount ?? 0;
  const ghosted       = analytics?.ghostedCount ?? 0;

  const checkInPieData = [
    { name: "Checked In", value: analytics?.checkedInCount || 0, color: "#0ea5e9" },
    { name: "Auto-Cancelled", value: analytics?.ghostedCount || 0, color: "#ea580c" },
    {
      name:  "Pending Check-in",
      value: Math.max(
        0,
        (analytics?.totalApprovedBookings || 0) -
          (analytics?.checkedInCount || 0) -
          (analytics?.ghostedCount || 0)
      ),
      color: "#6366f1",
    },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      label: "Total Bookings",
      value: analytics?.totalBookings ?? 0,
      icon:  Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Approval Rate",
      value: `${analytics?.approvalRate ?? 0}%`,
      icon:  TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Cancellation Rate",
      value: `${analytics?.cancellationRate ?? 0}%`,
      icon:  XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Check-in Rate",
      value: `${analytics?.checkInRate ?? 0}%`,
      icon:  CheckCircle,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const userRows = analytics?.userStats || [];

  const handleDownloadReport = async () => {
    setReportLoading(true);
    try {
      const res = await downloadDailyReport(reportDate);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `booking-report-${reportDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900">Booking Analytics</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Insights into booking behaviour, check-in rates and user patterns.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daily Booking Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and download a PDF report of all bookings for a specific date.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
          />
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={reportLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {reportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {reportLoading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-slide-up"
          >
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bookings by Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across all statuses</p>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          {pieData.length === 0 ? (
            <EmptyChart message="No booking data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[entry.statusKey] || COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bookings by Day of Week</h2>
              <p className="text-xs text-slate-500 mt-0.5">Volume by weekday</p>
            </div>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          {barDayData.length === 0 ? (
            <EmptyChart message="No booking data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v) => [v, "Bookings"]}
                />
                <Bar dataKey="count" fill="#1e293b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Check-in summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 animate-slide-up">
        <h2 className="text-base font-bold text-slate-900 mb-1">Check-in Overview</h2>
        <p className="text-xs text-slate-500 mb-6">Approved and auto-cancelled bookings vs attendance</p>

        {totalApproved === 0 ? (
          <EmptyChart message="No approved bookings to analyse yet" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Approved</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">{totalApproved}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Checked In</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{checkedIn}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Ghosted (Auto-Cancelled)
                </p>
                <p className="text-3xl font-extrabold text-red-600 mt-1">{ghosted}</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8 mt-6">
              <div style={{ width: 220, height: 220 }}>
                <PieChart width={220} height={220}>
                  <Pie
                    data={checkInPieData}
                    cx={105}
                    cy={105}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {checkInPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                {checkInPieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-600 flex-1">{entry.name}</span>
                    <span className="text-sm font-bold text-slate-900">{entry.value}</span>
                    <span className="text-xs text-slate-400 w-12 text-right">
                      {analytics.totalApprovedBookings > 0
                        ? Math.round((entry.value / analytics.totalApprovedBookings) * 100) + "%"
                        : "0%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">
              <span className="text-2xl font-bold text-emerald-600">{analytics.checkInRate}%</span>
              <br />
              check-in rate
            </p>
          </>
        )}
      </div>

      {/* User behaviour */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Behaviour</h2>
            <p className="text-xs text-slate-500 mt-0.5">Top 10 users by booking activity</p>
          </div>
          <Users className="h-5 w-5 text-slate-400" />
        </div>

        {userRows.length === 0 ? (
          <div className="mt-6">
            <EmptyChart message="No user booking data yet" />
          </div>
        ) : (
          <div className="mt-6 border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-right">Total Bookings</th>
                  <th className="px-4 py-3 text-right">Cancelled</th>
                  <th className="px-4 py-3 text-right">Auto-Cancelled</th>
                  <th className="px-4 py-3 text-right">Cancellation Rate</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((u, idx) => (
                  <tr
                    key={u.userId ?? idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {initialsFromName(u.userName)}
                        </span>
                        <span className="font-semibold text-slate-900">{u.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{u.totalBookings}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{u.cancelledBookings ?? 0}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{u.autoCancelledBookings ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-full text-xs font-bold ${cancellationBadgeClass(u.cancellationRate)}`}
                      >
                        {u.cancellationRate ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default BookingAnalyticsPage;
