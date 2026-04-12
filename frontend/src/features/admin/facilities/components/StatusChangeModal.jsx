import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { updateResourceStatus } from "../services/facilityApi";

const STATUS_OPTIONS = [
  { value: "AVAILABLE",         label: "Available",          color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "MAINTENANCE",    label: "Maintenance",     color: "text-amber-600   bg-amber-50   border-amber-200"   },
  { value: "OUT_OF_SERVICE", label: "Out of Service",  color: "text-red-600     bg-red-50     border-red-200"     },
];

const StatusChangeModal = ({ resource, onClose, onSaved }) => {
  const [selected, setSelected] = useState(resource.status);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSave = async () => {
    if (selected === resource.status) { onClose(); return; }
    setLoading(true);
    setError("");
    try {
      await updateResourceStatus(resource.id, selected);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Change Status</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            Update status for <span className="font-semibold text-slate-800">{resource.name}</span>
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-xl mb-4 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {STATUS_OPTIONS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setSelected(value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  selected === value
                    ? color + " border-current"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {label}
                {selected === value && (
                  <span className="float-right">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;