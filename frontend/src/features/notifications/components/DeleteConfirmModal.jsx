import { useState } from "react";
import { Trash2, Loader2, X } from "lucide-react";
import { deleteResource } from "../services/facilityApi";

const DeleteConfirmModal = ({ resource, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteResource(resource.id);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete resource.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Delete Resource</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-center text-slate-700 text-sm">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900">"{resource.name}"</span>?
            This action cannot be undone.
          </p>
          {error && (
            <p className="mt-3 text-center text-red-600 text-sm bg-red-50 rounded-xl py-2 px-4">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;