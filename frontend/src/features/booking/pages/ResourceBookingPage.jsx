import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  CalendarDays,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react";
import { createBooking } from "../../../api/bookingApi";
import axiosClient from "../../../api/axiosClient";
import { resolveApiHttpError } from "../../../api/httpError";

// ── Helper ────────────────────────────────────────────────────────────────────

const toLocalISO = (dateStr) => {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

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

const generateWeeklyPreview = (startStr, endDateStr) => {
  if (!startStr || !endDateStr) return [];
  const slots = [];
  let current = new Date(startStr);
  const end = new Date(endDateStr + "T23:59:59");
  while (current <= end && slots.length < 20) {
    slots.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return slots;
};

// ── Component ─────────────────────────────────────────────────────────────────

const ResourceBookingPage = () => {
  const { resourceId } = useParams();
  const navigate       = useNavigate();

  const [resource, setResource]           = useState(null);
  const [blockedSlots, setBlockedSlots]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [purpose, setPurpose]             = useState("");
  const [attendees, setAttendees]         = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [successMessage, setSuccessMessage]   = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrencePreview, setRecurrencePreview] = useState([]);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchBlockedSlots = async () => {
    const res = await axiosClient.get(
      `/api/bookings/public/calendar?resourceId=${resourceId}`
    );
    setBlockedSlots(res.data.data || res.data || []);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resourceRes] = await Promise.all([
          axiosClient.get(`/api/resources/${resourceId}`),
        ]);
        setResource(resourceRes.data.data || resourceRes.data);
        await fetchBlockedSlots();
      } catch (err) {
        setError(resolveApiHttpError(err).message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [resourceId]);

  useEffect(() => {
    if (isRecurring && selectedSlot && recurrenceEndDate) {
      setRecurrencePreview(generateWeeklyPreview(selectedSlot.start, recurrenceEndDate));
    } else {
      setRecurrencePreview([]);
    }
  }, [isRecurring, selectedSlot, recurrenceEndDate]);

  // ── Calendar events ───────────────────────────────────────────────────────

  const blockedEvents = blockedSlots.map((slot) => ({
    id: "blocked-" + slot.id,
    title: "Booked",
    start: slot.startTime,
    end: slot.endTime,
    backgroundColor: "rgba(71, 85, 105, 0.88)",
    borderColor: "rgba(51, 65, 85, 0.35)",
    textColor: "#f8fafc",
    display: "block",
    classNames: ["fc-event-booked-slot"],
  }));

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const now   = new Date();
    const start = new Date(selectedSlot.start);

    if (start <= now) {
      setValidationError("Please select a future time slot.");
      return;
    }
    if (!purpose.trim()) {
      setValidationError("Purpose is required.");
      return;
    }
    if (isRecurring && !recurrenceEndDate) {
      setValidationError("Please choose a repeat-until date for your recurring booking.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await createBooking({
        resourceId: Number(resourceId),
        startTime: toLocalISO(selectedSlot.start),
        endTime: toLocalISO(selectedSlot.end),
        purpose: purpose.trim(),
        attendees: attendees ? Number(attendees) : null,
        recurring: isRecurring,
        recurrenceEndDate: isRecurring ? recurrenceEndDate : null,
      });
      setShowModal(false);
      setPurpose("");
      setAttendees("");
      setSelectedSlot(null);
      setSuccessMessage(
        isRecurring
          ? `Recurring booking submitted! ${recurrencePreview.length} weekly sessions created, awaiting admin approval.`
          : "Booking submitted! Awaiting admin approval.",
      );
      setIsRecurring(false);
      setRecurrenceEndDate("");
      setRecurrencePreview([]);
      await fetchBlockedSlots();
    } catch (err) {
      const conflict = err.response?.data;
      if (err.response?.status === 409) {
        setSubmitError(
          conflict?.message ||
            "This resource has conflicting bookings. Please choose different times.",
        );
      } else {
        setSubmitError(resolveApiHttpError(err).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setValidationError(null);
    setSubmitError(null);
    setIsRecurring(false);
    setRecurrenceEndDate("");
    setRecurrencePreview([]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Facilities
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {!loading && resource && (
        <>
          {/* Resource info card */}
          <div className="premium-glass rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              {resource.name}
            </h1>
            <div className="flex flex-wrap gap-3 mb-4">
              {resource.location && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {resource.location}
                </span>
              )}
              {resource.capacity && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  {resource.capacity} people
                </span>
              )}
              {resource.availableFrom && resource.availableTo && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {resource.availableFrom} – {resource.availableTo}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Click and drag on the calendar to select a time slot.
            </p>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-500 hover:text-emerald-700 transition-colors ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Calendar */}
          <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-md shadow-sky-900/[0.04] ring-1 ring-slate-100">
            <div className="flex flex-col gap-0.5 border-b border-sky-100/90 bg-gradient-to-r from-sky-50/95 via-white to-indigo-50/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm ring-1 ring-sky-100">
                  <CalendarDays className="h-5 w-5 stroke-[1.6]" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-sky-700/85">
                    Weekly schedule
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    Drag across an open slot to book
                  </p>
                </div>
              </div>
              
            </div>
            <div className="booking-calendar-shell bg-white px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                selectable={true}
                selectMirror={true}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                scrollTime="08:00:00"
                weekends={true}
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "timeGridWeek,timeGridDay",
                }}
                events={blockedEvents}
                select={(info) => {
                  setSelectedSlot({ start: info.startStr, end: info.endStr });
                  setShowModal(true);
                  setValidationError(null);
                  setSubmitError(null);
                }}
                eventClick={() => {}}
                height="auto"
                eventDisplay="block"
                nowIndicator={true}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-slate-500/90 ring-1 ring-slate-400/40" />
              Booked (unavailable)
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:inline" aria-hidden />
            <span className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm border border-indigo-200 bg-indigo-50" />
              Free — click and drag to select
            </span>
          </div>
        </>
      )}

      {/* ── Booking modal ────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={handleCloseModal}
            aria-hidden
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-sky-900/10 ring-1 ring-slate-200/70 animate-slide-up"
          >
            <div className="h-1 bg-gradient-to-r from-sky-800 via-sky-900 to-indigo-900" />

            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-sky-600/90 mb-1">
                  New booking
                </p>
                <h2
                  id="booking-modal-title"
                  className="text-xl font-bold text-slate-900 tracking-tight"
                >
                  Confirm your slot
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Request will be sent for admin approval.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-2 space-y-5">
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/30 p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm ring-1 ring-sky-100">
                    <Clock className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700/80">
                      Selected time
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 leading-snug">
                      {formatDateTime(selectedSlot?.start)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      <span className="text-sky-500/90">→</span>{" "}
                      {formatDateTime(selectedSlot?.end)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sky-500 shadow-sm ring-1 ring-slate-100">
                  <MapPin className="h-4 w-4 stroke-[1.75]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Resource
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-800">{resource?.name}</p>
                </div>
              </div>

              {(validationError || submitError) && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{validationError || submitError}</span>
                </div>
              )}

              <div>
                <label className="mb-2 flex items-baseline gap-1.5 text-sm font-semibold text-slate-800">
                  Purpose
                  <span className="text-xs font-bold text-rose-500">*</span>
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="What will you use this space for?"
                  className="w-full resize-none rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-sky-200 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/15"
                />
                <p className="mt-1.5 text-right text-[11px] font-medium text-slate-400 tabular-nums">
                  {purpose.length}/500
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Attendees{" "}
                  <span className="text-xs font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="number"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  min={1}
                  placeholder="e.g. 10"
                  className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-sky-200 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/15"
                />
              </div>

              {/* Recurring toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Repeat Weekly</p>
                  <p className="text-xs text-slate-500">Book this slot every week</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecurring((v) => !v);
                    setRecurrenceEndDate("");
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isRecurring ? "bg-slate-900" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isRecurring ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Repeat until date picker - only shown when recurring is on */}
              {isRecurring && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Repeat Until <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  />
                  {recurrencePreview.length > 0 && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        ↻ {recurrencePreview.length} sessions will be created:
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {recurrencePreview.map((date, i) => (
                          <p key={i} className="text-xs text-slate-500">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/80 hover:text-sky-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-900 to-indigo-900 px-4 py-3 text-sm font-bold text-white shadow-md shadow-sky-900/35 transition-all duration-200 hover:from-sky-800 hover:to-indigo-800 hover:shadow-lg hover:shadow-sky-900/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:shadow-md disabled:active:scale-100"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Booking…
                    </>
                  ) : (
                    "Confirm booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceBookingPage;
