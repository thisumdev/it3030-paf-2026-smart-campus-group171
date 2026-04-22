import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect } from "react";
import {
  getMyBookings,
  createBooking,
  cancelBooking,
  getResources,
} from "../../../api/bookingApi";
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDateTime = (isoStr) => {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusColor = (status) => {
  if (status === "APPROVED")
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (status === "PENDING")
    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  return "bg-red-50 text-red-700 border border-red-200";
};

const eventBg = (status) => {
  if (status === "APPROVED") return "#22c55e";
  if (status === "PENDING") return "#eab308";
  return "#ef4444";
};

// ── Main Component ────────────────────────────────────────────────────────────

const BookingCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conflictError, setConflictError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form state
  const [form, setForm] = useState({
    resourceId: "",
    purpose: "",
    attendees: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setError(null);
      const [bookingsRes, resourcesRes] = await Promise.all([
        getMyBookings(),
        getResources(),
      ]);
      setBookings(bookingsRes.data.data || bookingsRes.data || []);
      setResources(resourcesRes.data.data?.content || resourcesRes.data.content || resourcesRes.data || []);
    } catch {
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Calendar events ───────────────────────────────────────────────────────

  const calendarEvents = bookings
    .filter((b) => !selectedResource || b.resourceId === Number(selectedResource))
    .map((b) => ({
      id: b.id,
      title: b.purpose,
      start: b.startTime,
      end: b.endTime,
      backgroundColor: eventBg(b.status),
      borderColor: "transparent",
      extendedProps: { ...b },
    }));

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelect = (info) => {
    setSelectedSlot({ start: info.startStr, end: info.endStr });
    setShowModal(true);
    setConflictError(null);
    setForm({ resourceId: "", purpose: "", attendees: "" });
  };

  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setConflictError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setConflictError(null);
    try {
      await createBooking({
        resourceId: Number(form.resourceId),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        purpose: form.purpose,
        attendees: form.attendees ? Number(form.attendees) : null,
      });
      handleCloseModal();
      await fetchData();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data?.conflictingSlot) {
        setConflictError(data.conflictingSlot);
      } else {
        setConflictError(null);
        setError(data?.message || "Failed to create booking.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      setSelectedBooking(null);
      await fetchData();
    } catch {
      setError("Failed to cancel booking. Please try again.");
    }
  };

  const availableResources = resources.filter(
    (r) => r.status === "AVAILABLE"
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Booking Calendar</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Click and drag on the calendar to create a new booking.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* ── Left: Calendar ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="premium-glass rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
            {/* Resource filter */}
            <div className="relative">
              <select
                value={selectedResource ?? ""}
                onChange={(e) =>
                  setSelectedResource(e.target.value || null)
                }
                className="appearance-none pl-3 pr-8 py-2 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-primary-900 transition-all duration-200 hover:border-slate-300 cursor-pointer"
              >
                <option value="">All Resources</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                Approved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />
                Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                Cancelled / Rejected
              </span>
            </div>
          </div>

          {/* Calendar */}
          <div className="premium-glass rounded-2xl p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              selectable={true}
              selectMirror={true}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={calendarEvents}
              select={handleSelect}
              eventClick={handleEventClick}
              height="auto"
              eventDisplay="block"
              nowIndicator={true}
            />
          </div>
        </div>

        {/* ── Right: Booking detail sidebar ──────────────────────────────── */}
        {selectedBooking && (
          <div className="w-80 shrink-0 animate-slide-left">
            <div className="premium-glass rounded-2xl p-5 sticky top-24">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Booking Details
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-4 ${statusColor(selectedBooking.status)}`}
              >
                {selectedBooking.status}
              </span>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5 text-slate-600">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedBooking.resourceName}
                    </p>
                    {selectedBooking.resourceLocation && (
                      <p className="text-slate-500 text-xs">
                        {selectedBooking.resourceLocation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-600">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                  <div>
                    <p className="font-medium">
                      {formatDateTime(selectedBooking.startTime)}
                    </p>
                    <p className="text-slate-500 text-xs">
                      → {formatDateTime(selectedBooking.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-600">
                  <Calendar className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                  <p className="text-slate-700">{selectedBooking.purpose}</p>
                </div>

                {selectedBooking.attendees && (
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Users className="h-4 w-4 shrink-0 text-slate-400" />
                    <p>
                      {selectedBooking.attendees}{" "}
                      {selectedBooking.attendees === 1
                        ? "attendee"
                        : "attendees"}
                    </p>
                  </div>
                )}

                {selectedBooking.rejectionReason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700">
                    <p className="font-semibold mb-0.5">Rejection reason:</p>
                    <p>{selectedBooking.rejectionReason}</p>
                  </div>
                )}

                {selectedBooking.checkedIn && (
                  <div className="flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Checked in at {formatDateTime(selectedBooking.checkedInAt)}
                  </div>
                )}
              </div>

              {/* Cancel button */}
              {(selectedBooking.status === "PENDING" ||
                selectedBooking.status === "APPROVED") && (
                <button
                  onClick={() => handleCancel(selectedBooking.id)}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Booking creation modal ──────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Booking</h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Selected time range */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
                <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">
                  Selected time
                </p>
                <p className="font-semibold">
                  {formatDateTime(selectedSlot?.start)}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  → {formatDateTime(selectedSlot?.end)}
                </p>
              </div>

              {/* Conflict error */}
              {conflictError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    This resource is already booked from{" "}
                    <strong>{formatDateTime(conflictError.start)}</strong> to{" "}
                    <strong>{formatDateTime(conflictError.end)}</strong>.
                  </span>
                </div>
              )}

              {/* Resource */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Resource <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="resourceId"
                    value={form.resourceId}
                    onChange={handleFormChange}
                    required
                    className="appearance-none w-full pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-primary-900 transition-all duration-200 hover:border-slate-300"
                  >
                    <option value="">Select a resource…</option>
                    {availableResources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.location ? ` — ${r.location}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleFormChange}
                  required
                  maxLength={500}
                  rows={3}
                  placeholder="Describe the purpose of this booking…"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-primary-900 transition-all duration-200 hover:border-slate-300 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {form.purpose.length}/500
                </p>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Attendees{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  name="attendees"
                  value={form.attendees}
                  onChange={handleFormChange}
                  min={1}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-primary-900 transition-all duration-200 hover:border-slate-300"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-bold hover:bg-primary-800 transition-all duration-200 hover:shadow-lg hover:shadow-primary-900/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {formLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Booking…
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
