import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createResource, updateResource } from "../services/facilityApi";

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUS_OPTIONS = ["AVAILABLE", "MAINTENANCE", "OUT_OF_SERVICE"];

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

const empty = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  availableFrom: "08:00",
  availableTo: "20:00",
  description: "",
  status: "AVAILABLE",   // ← fixed from ACTIVE
  imageUrl: "",
};

const ResourceFormModal = ({ resource, onClose, onSaved }) => {
  const isEdit = Boolean(resource);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (resource) {
      setForm({
        name: resource.name || "",
        type: resource.type || "LECTURE_HALL",
        capacity: resource.capacity ?? "",
        location: resource.location || "",
        availableFrom: resource.availableFrom || "08:00",
        availableTo: resource.availableTo || "20:00",
        description: resource.description || "",
        status: resource.status || "AVAILABLE",   // ← fixed from ACTIVE
        imageUrl: resource.imageUrl || "",
      });
    }
  }, [resource]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (form.type !== "EQUIPMENT" && form.capacity !== "" && Number(form.capacity) < 1)
      e.capacity = "Capacity must be at least 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        ...form,
        capacity: form.capacity === "" ? null : Number(form.capacity),
      };
      if (isEdit) {
        await updateResource(resource.id, payload);
      } else {
        await createResource(payload);
      }
      onSaved();
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((ev) => ({ ...ev, [key]: undefined }));
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit Resource" : "Add New Resource"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {apiError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Resource Name <span className="text-red-500">*</span>
            </label>
            <input
              {...field("name")}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900 ${
                errors.name ? "border-red-400 bg-red-50" : "border-slate-200"
              }`}
              placeholder="e.g. Computer Lab 1"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                {...field("type")}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                {...field("status")}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Capacity
                {form.type === "EQUIPMENT" && (
                  <span className="ml-1 text-slate-400 font-normal">(N/A for equipment)</span>
                )}
              </label>
              <input
                type="number"
                min={1}
                {...field("capacity")}
                disabled={form.type === "EQUIPMENT"}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="e.g. 40"
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                {...field("location")}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900 ${
                  errors.location ? "border-red-400 bg-red-50" : "border-slate-200"
                }`}
                placeholder="e.g. Block A, Ground Floor"
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Availability Window */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Available From
              </label>
              <input
                type="time"
                {...field("availableFrom")}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Available To
              </label>
              <input
                type="time"
                {...field("availableTo")}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              {...field("description")}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900 resize-none"
              placeholder="Brief description of the resource..."
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Image URL <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              {...field("imageUrl")}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Resource"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceFormModal;