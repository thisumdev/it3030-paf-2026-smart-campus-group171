import { useState, useEffect } from "react";
import { getResourceAnalytics } from "../services/facilityApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Loader2, AlertCircle, TrendingUp, MapPin, Wrench,
  XCircle, Activity, FileDown, CheckCircle, Clock,
} from "lucide-react";

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

// PDF Export 
const exportToPDF = (analytics) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  const peakHour = analytics?.peakHours?.length
    ? analytics.peakHours.reduce((a, b) => (b.bookingCount > a.bookingCount ? b : a))
    : null;

  const topResource = analytics?.topResources?.[0] ?? null;
  const healthRate  = analytics?.totalResources
    ? Math.round((analytics.activeResources / analytics.totalResources) * 100)
    : 0;

  // Top resources rows
  const topRows = (analytics?.topResources || []).map((r, i) => `
    <tr>
      <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;color:#0f172a">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${COLORS[i % COLORS.length]};color:white;font-size:10px;font-weight:700;margin-right:8px">${i + 1}</span>
        ${r.name}
      </td>
      <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;color:#64748b">${TYPE_LABELS[r.type] || r.type}</td>
      <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f172a;text-align:center">${r.bookingCount}</td>
    </tr>`).join("") || `<tr><td colspan="3" style="padding:20px;text-align:center;color:#94a3b8;font-style:italic">No booking data available yet</td></tr>`;

  // Resource type rows
  const typeRows = Object.entries(analytics?.countByType || {}).map(([type, count]) => `
    <tr>
      <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;color:#475569">${TYPE_LABELS[type] || type}</td>
      <td style="padding:11px 16px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f172a;text-align:center">${count}</td>
    </tr>`).join("") || `<tr><td colspan="2" style="padding:20px;text-align:center;color:#94a3b8;font-style:italic">No data available</td></tr>`;

  // Peak hours rows — only show hours with bookings, sorted descending
  const sortedHours = [...(analytics?.peakHours || [])].sort((a, b) => b.bookingCount - a.bookingCount);
  const maxBookings  = sortedHours[0]?.bookingCount || 1;
  const peakRows = sortedHours.length
    ? sortedHours.map(h => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#475569;width:100px">${HOUR_LABELS(h.hour)}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="height:10px;border-radius:5px;background:${h.bookingCount === maxBookings ? '#1e293b' : '#cbd5e1'};width:${Math.max(12, Math.round((h.bookingCount / maxBookings) * 180))}px"></div>
            <span style="font-weight:${h.bookingCount === maxBookings ? '700' : '500'};color:${h.bookingCount === maxBookings ? '#0f172a' : '#64748b'}">${h.bookingCount} booking${h.bookingCount !== 1 ? 's' : ''}</span>
            ${h.bookingCount === maxBookings ? '<span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:4px">PEAK</span>' : ''}
          </div>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="2" style="padding:20px;text-align:center;color:#94a3b8;font-style:italic">No booking data available yet</td></tr>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Daily Facilities Report — ${dateStr}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI', system-ui, sans-serif; background:#ffffff; color:#0f172a; font-size:13px; line-height:1.5; }
    @page { margin: 20mm; }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
    }
    table { border-collapse: collapse; width: 100%; }
    th { font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; padding:10px 16px; text-align:left; background:#f8fafc; }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:white;padding:36px 44px;border-radius:0 0 0 0">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;opacity:0.6">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">Smart Campus · Hub Admin</span>
        </div>
        <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px">Daily Facilities Report</h1>
        <p style="opacity:0.6;font-size:13px">Facilities &amp; Assets Catalogue — Usage Analytics</p>
      </div>
      <div style="text-align:right">
        <div style="font-size:13px;font-weight:600;opacity:0.9">${dateStr}</div>
        <div style="font-size:12px;opacity:0.6;margin-top:3px">Generated at ${timeStr}</div>
      </div>
    </div>
  </div>

  <div style="padding:36px 44px">

    <!-- Section 1: Facility Status Overview -->
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:16px;background:#1e293b;border-radius:2px;display:inline-block"></span>
        Facility Status Overview
      </h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th style="text-align:center">Count</th>
            <th style="text-align:center">% of Total</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9">
              <span style="display:inline-flex;align-items:center;gap:6px">
                <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block"></span>
                <span style="font-weight:500">Active / Available</span>
              </span>
            </td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;font-size:16px;color:#10b981">${analytics?.activeResources ?? 0}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b">${analytics?.totalResources ? Math.round((analytics.activeResources / analytics.totalResources) * 100) : 0}%</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b">Ready for booking</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9">
              <span style="display:inline-flex;align-items:center;gap:6px">
                <span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block"></span>
                <span style="font-weight:500">Under Maintenance</span>
              </span>
            </td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;font-size:16px;color:#f59e0b">${analytics?.maintenanceResources ?? 0}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b">${analytics?.totalResources ? Math.round((analytics.maintenanceResources / analytics.totalResources) * 100) : 0}%</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b">Temporarily unavailable</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9">
              <span style="display:inline-flex;align-items:center;gap:6px">
                <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span>
                <span style="font-weight:500">Out of Service</span>
              </span>
            </td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;font-size:16px;color:#ef4444">${analytics?.outOfServiceResources ?? 0}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b">${analytics?.totalResources ? Math.round((analytics.outOfServiceResources / analytics.totalResources) * 100) : 0}%</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b">Not available for booking</td>
          </tr>
          <tr style="background:#f8fafc">
            <td style="padding:12px 16px;font-weight:700;color:#0f172a">Total Resources</td>
            <td style="padding:12px 16px;text-align:center;font-weight:800;font-size:16px;color:#0f172a">${analytics?.totalResources ?? 0}</td>
            <td style="padding:12px 16px;text-align:center;font-weight:700;color:#0f172a">100%</td>
            <td style="padding:12px 16px;color:#64748b">Facility health: <strong>${healthRate}% operational</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 2: Resources by Type -->
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:16px;background:#3b82f6;border-radius:2px;display:inline-block"></span>
        Resources by Type
      </h2>
      <table>
        <thead>
          <tr>
            <th>Resource Type</th>
            <th style="text-align:center">Total Count</th>
          </tr>
        </thead>
        <tbody>${typeRows}</tbody>
      </table>
    </div>

    <!-- Section 3: Top Booked Resources -->
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:16px;background:#10b981;border-radius:2px;display:inline-block"></span>
        Top Booked Resources
      </h2>
      <table>
        <thead>
          <tr>
            <th>Resource Name</th>
            <th>Type</th>
            <th style="text-align:center">Total Bookings</th>
          </tr>
        </thead>
        <tbody>${topRows}</tbody>
      </table>
    </div>

    <!-- Section 4: Peak Booking Hours -->
    <div style="margin-bottom:40px">
      <h2 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:16px;background:#f59e0b;border-radius:2px;display:inline-block"></span>
        Peak Booking Hours
      </h2>
      <table>
        <thead>
          <tr>
            <th style="width:120px">Hour</th>
            <th>Booking Volume</th>
          </tr>
        </thead>
        <tbody>${peakRows}</tbody>
      </table>
    </div>

    <!-- Key Highlights Box -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:32px">
      <h3 style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:12px">Key Highlights</h3>
      <ul style="list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <li style="color:#475569;font-size:12px">
          <span style="font-weight:600;color:#0f172a">Most Booked Resource: </span>
          ${topResource ? `${topResource.name} (${topResource.bookingCount} bookings)` : "No data available"}
        </li>
        <li style="color:#475569;font-size:12px">
          <span style="font-weight:600;color:#0f172a">Peak Hour: </span>
          ${peakHour ? `${HOUR_LABELS(peakHour.hour)} with ${peakHour.bookingCount} bookings` : "No data available"}
        </li>
        <li style="color:#475569;font-size:12px">
          <span style="font-weight:600;color:#0f172a">Facility Health: </span>
          ${healthRate}% operational (${analytics?.activeResources ?? 0} of ${analytics?.totalResources ?? 0} resources active)
        </li>
        <li style="color:#475569;font-size:12px">
          <span style="font-weight:600;color:#0f172a">Resource Categories: </span>
          ${Object.keys(analytics?.countByType || {}).length} types catalogued
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e2e8f0;padding-top:16px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;color:#94a3b8">Smart Campus Operations Hub · Facilities &amp; Assets Catalogue</span>
      <span style="font-size:11px;color:#94a3b8">Generated: ${dateStr} at ${timeStr}</span>
    </div>
  </div>

  
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `daily-facilities-report-${new Date().toISOString().split("T")[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

// ── Main Component ────────────────────────────────────────────────────────────

const FacilitiesAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [exporting, setExporting] = useState(false);

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

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      exportToPDF(analytics);
      setExporting(false);
    }, 300);
  };

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
  }));

  const pieData = Object.entries(analytics?.countByType || {}).map(([type, count]) => ({
    name:  TYPE_LABELS[type] || type,
    value: count,
  }));

  const statCards = [
    { label: "Total Resources",   value: analytics?.totalResources       ?? 0, icon: MapPin,     color: "bg-blue-50 text-blue-600"       },
    { label: "Active",            value: analytics?.activeResources       ?? 0, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
    { label: "Under Maintenance", value: analytics?.maintenanceResources  ?? 0, icon: Wrench,     color: "bg-amber-50 text-amber-600"     },
    { label: "Out of Service",    value: analytics?.outOfServiceResources ?? 0, icon: XCircle,    color: "bg-red-50 text-red-600"         },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usage Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Insights into resource utilisation, peak demand and facility health.
            </p>
          </div>

          {/* Export PDF Button  */}
          <button
            onClick={handleExport}
            disabled={exporting || !analytics}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
          >
            {exporting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <FileDown className="h-4 w-4" />
            }
            Export PDF
          </button>
        </div>

        {/* Date strip */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 w-fit">
          <Clock className="h-3.5 w-3.5" />
          <span>Daily report for <span className="font-semibold text-slate-700">{dateStr}</span></span>
        </div>
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
              <p className="text-xs text-slate-500 mt-0.5">Booking volume by hour of day</p>
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
          {!analytics?.topResources?.length ? (
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