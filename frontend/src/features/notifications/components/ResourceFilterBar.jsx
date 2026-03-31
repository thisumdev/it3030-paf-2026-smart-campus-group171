import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "LECTURE_HALL", label: "Lecture Hall" },
  { value: "LAB",          label: "Lab" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "EQUIPMENT",    label: "Equipment" },
];

const STATUS_OPTIONS = [
  { value: "",               label: "All Statuses" },
  { value: "ACTIVE",         label: "Active" },
  { value: "MAINTENANCE",    label: "Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
];

const ResourceFilterBar = ({ filters, onChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handle = (key) => (e) => onChange({ ...filters, [key]: e.target.value, page: 0 });

  const hasFilters = filters.name || filters.type || filters.status ||
                     filters.location || filters.minCapacity || filters.maxCapacity;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 space-y-3">
      {/* Row 1 — search + type + status + toggle */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Name search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={filters.name}
            onChange={handle("name")}
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
          />
        </div>

        {/* Type */}
        <select
          value={filters.type}
          onChange={handle("type")}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900 bg-white min-w-36"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={handle("status")}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900 bg-white min-w-36"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            showAdvanced
              ? "bg-slate-900 text-white border-slate-900"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {/* Row 2 — advanced filters */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-100 animate-fade-in">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Location</label>
            <input
              value={filters.location}
              onChange={handle("location")}
              placeholder="e.g. Block A"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Min Capacity</label>
            <input
              type="number"
              value={filters.minCapacity}
              onChange={handle("minCapacity")}
              min={1}
              placeholder="e.g. 20"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Max Capacity</label>
            <input
              type="number"
              value={filters.maxCapacity}
              onChange={handle("maxCapacity")}
              min={1}
              placeholder="e.g. 100"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceFilterBar;