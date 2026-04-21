import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, ArrowLeft, Loader2, Send } from "lucide-react";
import { createTicket, fetchResources } from "../services/ticketApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "IT_EQUIPMENT",
  "FURNITURE",
  "HVAC",
  "SAFETY",
  "OTHER",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "",
  category: "",
  resourceId: "",
  preferredContact: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

const SubmitTicketPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    fetchResources()
      .then(setResources)
      .catch(() => setServerError("Could not load resources. Please refresh."))
      .finally(() => setLoadingResources(false));
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.priority) e.priority = "Select a priority";
    if (!form.category) e.category = "Select a category";
    if (!form.resourceId) e.resourceId = "Select a resource";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      await createTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        category: form.category,
        resourceId: Number(form.resourceId),
        preferredContact: form.preferredContact.trim() || null,
      });
      navigate("/user/tickets");
    } catch (err) {
      setServerError(
        err?.response?.data?.message ?? "Failed to submit ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <button
          onClick={() => navigate("/user/tickets")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary-900" />
          Submit a Ticket
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Report a maintenance issue or campus problem.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slide-up max-w-2xl">
        {serverError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Broken AC in Room 203"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-primary-900/20 ${
                errors.title
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 focus:border-primary-900"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the issue in detail..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none transition-colors outline-none focus:ring-2 focus:ring-primary-900/20 ${
                errors.description
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 focus:border-primary-900"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={form.priority}
                onChange={set("priority")}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-primary-900/20 bg-white ${
                  errors.priority
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 focus:border-primary-900"
                }`}
              >
                <option value="">Select priority</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs text-red-600">{errors.priority}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={set("category")}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-primary-900/20 bg-white ${
                  errors.category
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 focus:border-primary-900"
                }`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Resource */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Location / Resource <span className="text-red-500">*</span>
            </label>
            <select
              value={form.resourceId}
              onChange={set("resourceId")}
              disabled={loadingResources}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none focus:ring-2 focus:ring-primary-900/20 bg-white disabled:opacity-50 ${
                errors.resourceId
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 focus:border-primary-900"
              }`}
            >
              <option value="">
                {loadingResources ? "Loading resources…" : "Select a resource"}
              </option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}{r.location ? ` — ${r.location}` : ""}
                </option>
              ))}
            </select>
            {errors.resourceId && (
              <p className="mt-1 text-xs text-red-600">{errors.resourceId}</p>
            )}
          </div>

          {/* Preferred Contact (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Preferred Contact{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.preferredContact}
              onChange={set("preferredContact")}
              placeholder="e.g. email, phone, or room number"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-60 shadow-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? "Submitting…" : "Submit Ticket"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/user/tickets")}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SubmitTicketPage;
