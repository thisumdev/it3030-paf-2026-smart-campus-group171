import { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  Search,
  X,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Trash2,
  Settings2,
  ChevronDown,
} from "lucide-react";
import {
  fetchAllTickets,
  updateTicketStatus,
  deleteAdminTicket,
  fetchTechnicians,
} from "../services/adminTicketApi";

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

const ALL_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Manage Modal ──────────────────────────────────────────────────────────────

const ManageModal = ({ ticket, technicians, onSave, onClose }) => {
  const [status, setStatus] = useState(ticket.status);
  const [reason, setReason] = useState(ticket.rejectionReason ?? "");
  const [notes, setNotes] = useState(ticket.resolutionNotes ?? "");
  const [assigneeId, setAssigneeId] = useState(
    ticket.assigneeId?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave(ticket.id, {
        status,
        reason: status === "REJECTED" ? reason : null,
        resolutionNotes: status === "RESOLVED" ? notes : null,
        assigneeId: assigneeId ? Number(assigneeId) : null,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to update ticket.");
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
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Manage Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
              #{ticket.id} · {ticket.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status */}
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
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s]?.label ?? s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Assign technician */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Assign Technician{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white appearance-none outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
              >
                <option value="">Unassigned</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Rejection reason */}
          {status === "REJECTED" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the ticket is being rejected…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
              />
            </div>
          )}

          {/* Resolution notes */}
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
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Settings2 className="h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal = ({ ticket, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">Delete Ticket</h3>
          <p className="text-sm text-slate-500 mt-1">
            Permanently delete{" "}
            <span className="font-semibold text-slate-800">
              "{ticket.title}"
            </span>
            ? This cannot be undone.
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [managing, setManaging] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, techs] = await Promise.all([
        fetchAllTickets(),
        fetchTechnicians(),
      ]);
      setTickets(data);
      setTechnicians(techs);
    } catch {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !t.title?.toLowerCase().includes(q) &&
        !t.reporterName?.toLowerCase().includes(q) &&
        !t.resourceName?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleSaveStatus = async (id, payload) => {
    const updated = await updateTicketStatus(id, payload);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    showToast("Ticket updated successfully");
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteAdminTicket(deleting.id);
      setTickets((prev) => prev.filter((t) => t.id !== deleting.id));
      setDeleting(null);
      showToast("Ticket deleted");
    } catch {
      showToast("Delete failed", false);
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s).length;
    return acc;
  }, {});

  return (
    <>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-6 w-6 text-red-500" />
              All Tickets
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {loading ? "Loading…" : `${visible.length} of ${tickets.length} tickets shown`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_STATUSES.map((s) => (
              <span
                key={s}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_META[s].cls}`}
              >
                {STATUS_META[s].label}: {counts[s] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 animate-slide-up flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, reporter, resource…"
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

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {["ALL", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_META[s]?.label ?? s}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex gap-1.5 flex-wrap">
          {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                priorityFilter === p
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p === "ALL" ? "Any Priority" : PRIORITY_META[p]?.label ?? p}
            </button>
          ))}
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            <p className="text-slate-400 text-sm">Loading tickets…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="text-slate-700 font-semibold">{error}</p>
            <button
              onClick={load}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Ticket className="h-10 w-10 text-slate-200" />
            <p className="text-slate-500 font-medium">No tickets found</p>
            {(search || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setPriorityFilter("ALL");
                }}
                className="text-sm text-slate-400 hover:text-slate-700 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["#", "Title", "Reporter", "Resource", "Priority", "Status", "Assignee", "Created", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visible.map((t) => {
                  const status = STATUS_META[t.status] ?? { label: t.status, cls: "bg-slate-100 text-slate-600" };
                  const priority = PRIORITY_META[t.priority] ?? { label: t.priority, cls: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                        #{t.id}
                      </td>
                      <td className="px-4 py-3.5 max-w-48">
                        <p className="font-semibold text-slate-900 truncate">{t.title}</p>
                        <p className="text-xs text-slate-400 truncate">{t.category?.replace(/_/g, " ")}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{t.reporterName}</td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap max-w-32 truncate">{t.resourceName}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.cls}`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                        {t.assigneeName ?? <span className="text-slate-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {fmt(t.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setManaging(t)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                            Manage
                          </button>
                          <button
                            onClick={() => setDeleting(t)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            aria-label="Delete ticket"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{visible.length}</span> ticket{visible.length !== 1 && "s"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manage modal */}
      {managing && (
        <ManageModal
          ticket={managing}
          technicians={technicians}
          onSave={handleSaveStatus}
          onClose={() => setManaging(null)}
        />
      )}

      {/* Delete modal */}
      {deleting && (
        <DeleteModal
          ticket={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-up ${
            toast.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default AdminTicketsPage;
