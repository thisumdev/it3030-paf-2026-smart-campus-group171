import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Clock,
  CalendarDays,
} from "lucide-react";
import {
  getNoShowBookings,
  restoreBooking,
  deleteBooking,
  getAllBookings,
} from "../../../../api/bookingApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCheckinStatus = (booking) => {
  const now   = new Date();
  const start = new Date(booking.startTime);
  if (booking.checkedIn) {
    const diff = Math.round((new Date(booking.checkedInAt) - start) / 60000);
    if (diff <= 0) return { label: "Checked in on time",        color: "bg-emerald-100 text-emerald-700" };
    return           { label: `Checked in ${diff} min late`,    color: "bg-amber-100 text-amber-700" };
  }
  if (now < start) return { label: "Not started yet",           color: "bg-slate-100 text-slate-500" };
  const minsElapsed = Math.round((now - start) / 60000);
  if (minsElapsed <= 15) return {
    label: `Check-in window open (${15 - minsElapsed} min left)`,
    color: "bg-blue-100 text-blue-700",
  };
  return { label: "Missed check-in", color: "bg-red-100 text-red-700" };
};

// ── Component ─────────────────────────────────────────────────────────────────

const CheckInRecordsPage = () => {
  const [allApprovedBookings,  setAllApprovedBookings]  = useState([]);
  const [autoCancelledBookings, setAutoCancelledBookings] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab]       = useState("attendance");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [allRes, autoCancelledRes] = await Promise.all([
        getAllBookings(),
        getNoShowBookings(),
      ]);
      const all = allRes.data.data || allRes.data || [];
      const approved = Array.isArray(all)
        ? all
            .filter((b) => b.status === "APPROVED")
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        : [];
      setAllApprovedBookings(approved);

      const cancelled = autoCancelledRes.data.data || autoCancelledRes.data || [];
      setAutoCancelledBookings(
        Array.isArray(cancelled)
          ? cancelled.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          : []
      );
    } catch {
      setError("Failed to load check-in records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRestore = async (booking) => {
    setActionLoading(booking.id);
    try {
      await restoreBooking(booking.id);
      fetchData();
    } catch {
      setError("Failed to restore booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteBooking(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch {
      setError("Failed to delete booking.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Check-in Records</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Monitor attendance for approved bookings and manage auto-cancellations.
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sky-500 shadow-sm">
            <Clock className="h-4 w-4 stroke-[2]" />
          </span>
          <span className="text-sm font-medium text-sky-900/80">
            {allApprovedBookings.length} approved · {autoCancelledBookings.length} auto-cancelled
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === "attendance"
              ? "bg-sky-800 text-white shadow-sm shadow-sky-200/40"
              : "bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-800"
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Attendance Tracker
          <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
            {allApprovedBookings.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("autocancelled")}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === "autocancelled"
              ? "bg-red-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <XCircle className="h-4 w-4" />
          Auto-Cancelled
          <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
            {autoCancelledBookings.length}
          </span>
          {autoCancelledBookings.length > 0 && activeTab !== "autocancelled" && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {/* ── ATTENDANCE TRACKER TAB ───────────────────────────────────────── */}
      {!loading && activeTab === "attendance" && (
        <>
          {allApprovedBookings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-600 font-semibold">No approved bookings found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allApprovedBookings.map((booking) => {
                const checkinStatus = getCheckinStatus(booking);
                return (
                  <div
                    key={booking.id}
                    className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:border-sky-200/50 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-200/60 bg-gradient-to-b from-sky-50/90 to-sky-100/40 text-sky-500"
                      aria-hidden
                    >
                      <CalendarDays className="h-[1.125rem] w-[1.125rem] stroke-[1.5]" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {booking.resourceName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Booked by {booking.userName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateTime(booking.startTime)} →{" "}
                        {formatDateTime(booking.endTime)}
                      </p>
                      {booking.purpose && (
                        <p className="text-xs text-slate-500 italic mt-0.5 truncate">
                          {booking.purpose}
                        </p>
                      )}
                    </div>

                    {/* Right: status badge + check-in time + delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${checkinStatus.color}`}>
                          {checkinStatus.label}
                        </span>
                        {booking.checkedIn && (
                          <p className="text-xs text-slate-400 mt-1">
                            at {formatDateTime(booking.checkedInAt)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setDeleteTarget(booking)}
                        title="Delete"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── AUTO-CANCELLED TAB ───────────────────────────────────────────── */}
      {!loading && activeTab === "autocancelled" && (
        <>
          {autoCancelledBookings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-slate-600 font-semibold">
                No auto-cancellations — great attendance! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {autoCancelledBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:border-amber-200/60 hover:shadow-md transition-all duration-200"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-amber-100/50 text-amber-600"
                    aria-hidden
                  >
                    <AlertTriangle className="h-[1.125rem] w-[1.125rem] stroke-[1.5]" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {booking.resourceName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Booked by {booking.userName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateTime(booking.startTime)} →{" "}
                      {formatDateTime(booking.endTime)}
                    </p>
                    {booking.purpose && (
                      <p className="text-xs text-slate-500 italic mt-0.5 truncate">
                        {booking.purpose}
                      </p>
                    )}
                  </div>

                  {/* Right: badge + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                        Auto-Cancelled
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        No check-in recorded
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestore(booking)}
                      disabled={actionLoading === booking.id}
                      title="Restore"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === booking.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <RotateCcw className="h-3.5 w-3.5" />}
                      Restore
                    </button>
                    <button
                      onClick={() => setDeleteTarget(booking)}
                      title="Delete"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl text-center animate-slide-up">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Booking?</h2>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently delete the booking for{" "}
              <span className="font-semibold text-slate-800">
                {deleteTarget?.resourceName}
              </span>{" "}
              by{" "}
              <span className="font-semibold text-slate-800">
                {deleteTarget?.userName}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckInRecordsPage;
