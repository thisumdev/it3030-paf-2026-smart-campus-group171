import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Plus, Loader2, AlertCircle, ChevronRight, Search, X } from "lucide-react";
import { fetchMyTickets } from "../services/ticketApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META = {
  OPEN:        { label: "Open",        cls: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-800" },
  RESOLVED:    { label: "Resolved",    cls: "bg-emerald-100 text-emerald-800" },
  CLOSED:      { label: "Closed",      cls: "bg-slate-100 text-slate-600" },
  REJECTED:    { label: "Rejected",    cls: "bg-red-100 text-red-800" },
};

const PRIORITY_META = {
  LOW:      { label: "Low",      cls: "bg-slate-100 text-slate-600" },
  MEDIUM:   { label: "Medium",   cls: "bg-amber-100 text-amber-800" },
  HIGH:     { label: "High",     cls: "bg-orange-100 text-orange-800" },
  CRITICAL: { label: "Critical", cls: "bg-red-100 text-red-800" },
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "IT_EQUIPMENT",
  "FURNITURE",
  "HVAC",
  "SAFETY",
  "OTHER",
];

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyTickets();
      setTickets(data);
    } catch {
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statuses = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

  const visible = tickets.filter((t) => {
    if (filter !== "ALL" && t.status !== filter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !t.title?.toLowerCase().includes(q) &&
        !t.resourceName?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary-900" />
              My Tickets
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Track and manage your maintenance requests.
            </p>
          </div>
          <button
            onClick={() => navigate("/user/tickets/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Submit Ticket
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {statuses.map((s) => {
          const count =
            s === "ALL"
              ? tickets.length
              : tickets.filter((t) => t.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                filter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_META[s]?.label ?? s}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === s
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or resource…"
            className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all"
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-red-500 gap-2">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={load}
            className="mt-2 text-xs text-slate-500 underline hover:text-slate-700"
          >
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-fade-in">
          <Ticket className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No tickets found</p>
          <p className="text-xs mt-1">
            {filter === "ALL" && !search && categoryFilter === "ALL"
              ? "Submit your first maintenance request."
              : "No tickets match your current filters."}
          </p>
          {(search || filter !== "ALL" || categoryFilter !== "ALL") ? (
            <button
              onClick={() => { setSearch(""); setFilter("ALL"); setCategoryFilter("ALL"); }}
              className="mt-3 text-xs text-slate-400 underline hover:text-slate-700"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={() => navigate("/user/tickets/new")}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-primary-900 text-white text-xs font-semibold rounded-xl hover:bg-primary-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Submit a ticket
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {visible.map((t) => {
            const status = STATUS_META[t.status] ?? { label: t.status, cls: "bg-slate-100 text-slate-600" };
            const priority = PRIORITY_META[t.priority] ?? { label: t.priority, cls: "bg-slate-100 text-slate-600" };
            return (
              <div
                key={t.id}
                onClick={() => navigate(`/user/tickets/${t.id}`)}
                className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <Ticket className="h-5 w-5 text-primary-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                      {status.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.cls}`}>
                      {priority.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {t.category?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 truncate">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{t.resourceName}</p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-[10px] text-slate-400">{timeAgo(t.createdAt)}</p>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MyTicketsPage;
