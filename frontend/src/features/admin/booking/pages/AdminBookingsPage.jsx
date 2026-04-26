import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Calendar,
} from "lucide-react";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  restoreBooking,
  deleteBooking,
  approveRecurringSeries,
  rejectRecurringSeries,
  deleteBookingById,
} from "../../../../api/bookingApi";
import {
  groupBookings,
  getStatusBadgeClass,
  formatDateTime,
  formatDateShort,
  formatTimeRange,
} from "../utils/bookingGroupUtils";

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "AUTO_CANCELLED",
];

const formatStatusLabel = (status) => {
  if (!status) return "";
  if (status === "AUTO_CANCELLED") return "Auto-Cancelled";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [groupedItems, setGroupedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllBookings();
      const data = res.data.data || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      setBookings(arr);
      setGroupedItems(groupBookings(arr));
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredItems = groupedItems.filter((item) => {
    if (statusFilter === "ALL") return true;
    if (item.type === "single") return item.booking.status === statusFilter;
    if (item.type === "recurring") return item.dominantStatus === statusFilter;
    return true;
  });

  const statusCounts = {
    ALL: groupedItems.length,
    PENDING: groupedItems.filter((i) =>
      i.type === "single"
        ? i.booking.status === "PENDING"
        : i.dominantStatus === "PENDING",
    ).length,
    APPROVED: groupedItems.filter((i) =>
      i.type === "single"
        ? i.booking.status === "APPROVED"
        : i.dominantStatus === "APPROVED",
    ).length,
    REJECTED: groupedItems.filter((i) =>
      i.type === "single"
        ? i.booking.status === "REJECTED"
        : i.dominantStatus === "REJECTED",
    ).length,
    CANCELLED: groupedItems.filter((i) =>
      i.type === "single"
        ? i.booking.status === "CANCELLED"
        : i.dominantStatus === "CANCELLED",
    ).length,
    AUTO_CANCELLED: groupedItems.filter((i) =>
      i.type === "single"
        ? i.booking.status === "AUTO_CANCELLED"
        : i.dominantStatus === "AUTO_CANCELLED",
    ).length,
  };

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await approveBooking(bookingId);
      fetchBookings();
    } catch {
      setError("Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAll = async (groupId) => {
    setActionLoading(groupId);
    try {
      await approveRecurringSeries(groupId);
      fetchBookings();
    } catch {
      setError("Failed to approve series.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(rejectTarget.id);
    try {
      if (rejectTarget.type === "series") {
        await rejectRecurringSeries(rejectTarget.groupId, rejectReason);
      } else {
        await rejectBooking(rejectTarget.id, rejectReason);
      }
      setRejectTarget(null);
      setRejectReason("");
      fetchBookings();
    } catch {
      setError("Failed to reject.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await restoreBooking(bookingId);
      fetchBookings();
    } catch {
      setError("Failed to restore booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      fetchBookings();
    } catch {
      setError("Failed to cancel booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === "series") {
        for (const session of deleteTarget.sessions) {
          await deleteBookingById(session.id);
        }
      } else {
        await deleteBooking(deleteTarget.id);
      }
      setDeleteTarget(null);
      fetchBookings();
    } catch {
      setError("Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleExpand = (groupId) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Review and manage all facility booking requests.
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sky-500 shadow-sm">
            <Calendar className="h-4 w-4 stroke-[2]" />
          </span>
          <span className="text-sm font-medium text-sky-900/80">
            {bookings.length} total bookings
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === s
                ? "bg-sky-800 text-white shadow-sm shadow-sky-200/50"
                : "bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-800"
            }`}
          >
            {s === "ALL"
              ? "All"
              : s === "AUTO_CANCELLED"
                ? "Auto-Cancelled"
                : s.charAt(0) + s.slice(1).toLowerCase()}
            <span
              className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold ${
                statusFilter === s ? "bg-white/20 text-white" : "bg-white text-slate-500"
              }`}
            >
              {statusCounts[s]}
            </span>
          </button>
        ))}
      </div>

      {!loading && !error && (
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Showing {filteredItems.length} of {groupedItems.length} items
        </p>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center py-20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200/70 bg-gradient-to-b from-sky-50 to-sky-100/50 text-sky-500">
            <Calendar className="h-7 w-7 stroke-[1.25]" />
          </div>
          <p className="text-slate-600 font-semibold">No bookings found</p>
          <p className="text-slate-400 text-sm mt-1">No bookings match the selected filter.</p>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="space-y-3">
          {filteredItems.map((item) =>
            item.type === "single" ? (
              <div
                key={item.booking.id}
                className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:border-sky-200/50 hover:shadow-md transition-all duration-200"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-200/60 bg-gradient-to-b from-sky-50/90 to-sky-100/40 text-sky-500"
                  aria-hidden
                >
                  <Calendar className="h-[1.125rem] w-[1.125rem] stroke-[1.5]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {item.booking.resourceName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Booked by {item.booking.userName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDateTime(item.booking.startTime)} →{" "}
                    {formatDateTime(item.booking.endTime)}
                  </p>
                  {item.booking.purpose && (
                    <p className="text-xs text-slate-500 italic mt-0.5 truncate">
                      {item.booking.purpose}
                    </p>
                  )}
                </div>

                {item.booking.attendees && (
                  <span className="text-xs text-slate-500 hidden md:block shrink-0">
                    {item.booking.attendees} people
                  </span>
                )}

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${getStatusBadgeClass(item.booking.status)}`}
                >
                  {formatStatusLabel(item.booking.status)}
                </span>

                {item.booking.status === "PENDING" && (
                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(item.booking.id)}
                      disabled={actionLoading === item.booking.id}
                      title="Approve"
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === item.booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRejectTarget({
                          type: "single",
                          id: item.booking.id,
                          userName: item.booking.userName,
                          resourceName: item.booking.resourceName,
                        })
                      }
                      disabled={actionLoading === item.booking.id}
                      title="Reject"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === item.booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {item.booking.status === "AUTO_CANCELLED" && (
                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestore(item.booking.id)}
                      disabled={actionLoading === item.booking.id}
                      title="Restore"
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === item.booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(item.booking.id)}
                      disabled={actionLoading === item.booking.id}
                      title="Cancel"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === item.booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      type: "single",
                      id: item.booking.id,
                      resourceName: item.booking.resourceName,
                      userName: item.booking.userName,
                    })
                  }
                  title="Delete"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                key={item.groupId}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="px-5 py-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                    ↻
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{item.resourceName}</p>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                        ↻ {item.sessionCount} sessions
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Booked by {item.userName}</p>
                    <p className="text-xs text-slate-400">
                      Every week · {formatDateShort(item.firstSession.startTime)} –{" "}
                      {formatDateShort(item.lastSession.startTime)} ·{" "}
                      {formatTimeRange(item.firstSession.startTime, item.firstSession.endTime)}
                    </p>
                    <p className="text-xs text-slate-500 italic">{item.purpose}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.attendees && (
                      <span className="text-xs text-slate-500 hidden md:block">
                        {item.attendees} people
                      </span>
                    )}

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeClass(item.dominantStatus)}`}
                    >
                      {formatStatusLabel(item.dominantStatus)}
                    </span>

                    {item.dominantStatus === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveAll(item.groupId)}
                          disabled={actionLoading === item.groupId}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          {actionLoading === item.groupId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Approve All
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRejectTarget({
                              type: "series",
                              id: item.groupId,
                              groupId: item.groupId,
                              userName: item.userName,
                              resourceName: item.resourceName,
                            })
                          }
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <XCircle className="h-3 w-3" /> Reject All
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "series",
                          sessions: item.sessions,
                          resourceName: item.resourceName,
                          userName: item.userName,
                        })
                      }
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(item.groupId)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {expandedGroups.has(item.groupId) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedGroups.has(item.groupId) && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    {item.sessions.map((session, idx) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 last:border-b-0"
                      >
                        <span className="text-xs font-semibold text-slate-400 w-16 flex-shrink-0">
                          Session {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">
                            {formatDateShort(session.startTime)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatTimeRange(session.startTime, session.endTime)}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(session.status)}`}
                        >
                          {formatStatusLabel(session.status)}
                        </span>
                        <div className="flex items-center gap-1">
                          {session.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(session.id)}
                                disabled={actionLoading === session.id}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve this session"
                              >
                                {actionLoading === session.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setRejectTarget({
                                    type: "single",
                                    id: session.id,
                                    userName: item.userName,
                                    resourceName: item.resourceName,
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject this session"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "single",
                                id: session.id,
                                resourceName: item.resourceName,
                                userName: item.userName,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete this session"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl text-center">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Booking?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently delete{" "}
              {deleteTarget.type === "series" ? "all sessions of" : "the booking for"}{" "}
              <strong>{deleteTarget.resourceName}</strong> by{" "}
              <strong>{deleteTarget.userName}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl animate-slide-up">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Reject Booking</h2>
            <p className="text-sm text-slate-600 mb-4">
              Provide a reason for rejecting{" "}
              {rejectTarget.type === "series" ? "all sessions of" : "this booking for"}{" "}
              <span className="font-semibold text-slate-800">{rejectTarget.resourceName}</span> by{" "}
              <span className="font-semibold text-slate-800">{rejectTarget.userName}</span>.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-primary-900 transition-all duration-200 hover:border-slate-300 mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={actionLoading != null || !rejectReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading != null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rejecting…
                  </>
                ) : (
                  "Confirm Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBookingsPage;
