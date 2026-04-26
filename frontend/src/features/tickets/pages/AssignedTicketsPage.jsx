import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Loader2,
  AlertCircle,
  ChevronRight,
  Settings2,
  X,
  ChevronDown,
} from "lucide-react";
import { fetchAssignedTickets, updateTicketStatus } from "../services/ticketApi";

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

const TECHNICIAN_STATUSES = ["IN_PROGRESS", "RESOLVED"];

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Status Update Modal ───────────────────────────────────────────────────────

const StatusModal = ({ ticket, onSave, onClose }) => {
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState(ticket.resolutionNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave(ticket.id, {
        status,
        resolutionNotes: status === "RESOLVED" ? notes : null,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-slide-up">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Update Status</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
              #{ticket.id} · {ticket.title}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white appearance-none outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
              >
                {TECHNICIAN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s]?.label ?? s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {status === "RESOLVED" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Resolution Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe how the issue was resolved…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary-900 text-white font-medium hover:bg-primary-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AssignedTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [managing, setManaging] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssignedTickets();
      setTickets(data);
    } catch {
      setError("Failed to load assigned tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveStatus = async (id, payload) => {
    const updated = await updateTicketStatus(id, payload);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const visible =
    filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  const statuses = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

  return (
    <>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary-900" />
          Assigned to Me
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Tickets assigned to you for resolution.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {statuses.map((s) => {
          const count =
            s === "ALL" ? tickets.length : tickets.filter((t) => t.status === s).length;
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
                  filter === s ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
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
          <button onClick={load} className="mt-2 text-xs text-slate-500 underline hover:text-slate-700">
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-fade-in">
          <Wrench className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No tickets assigned</p>
          <p className="text-xs mt-1">
            {filter === "ALL"
              ? "You have no assigned tickets."
              : `No tickets with status "${STATUS_META[filter]?.label ?? filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {visible.map((t) => {
            const status = STATUS_META[t.status] ?? { label: t.status, cls: "bg-slate-100 text-slate-600" };
            const priority = PRIORITY_META[t.priority] ?? { label: t.priority, cls: "bg-slate-100 text-slate-600" };
            return (
              <div
                key={t.id}
                className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-5 w-5 text-amber-600" />
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/user/tickets/${t.id}`)}
                >
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
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.reporterName} · {t.resourceName}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-[10px] text-slate-400">{timeAgo(t.createdAt)}</p>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(t.status === "OPEN" || t.status === "IN_PROGRESS") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setManaging(t);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Update
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/user/tickets/${t.id}`)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {managing && (
        <StatusModal
          ticket={managing}
          onSave={handleSaveStatus}
          onClose={() => setManaging(null)}
        />
      )}
    </>
  );
};

export default AssignedTicketsPage;
