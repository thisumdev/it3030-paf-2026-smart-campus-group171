import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, MapPin, Users, Clock, Loader2, AlertCircle } from "lucide-react";
import { searchResources } from "../../admin/facilities/services/facilityApi";

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "",               label: "All Types" },
  { value: "LECTURE_HALL",   label: "Lecture Hall" },
  { value: "LAB",            label: "Lab" },
  { value: "MEETING_ROOM",   label: "Meeting Room" },
  { value: "EQUIPMENT",      label: "Equipment" },
];

const TYPE_ICONS = {
  LECTURE_HALL: "🏛️",
  LAB:          "🔬",
  MEETING_ROOM: "🤝",
  EQUIPMENT:    "📷",
};

const TYPE_COLORS = {
  LECTURE_HALL: "bg-blue-100 text-blue-700",
  LAB:          "bg-purple-100 text-purple-700",
  MEETING_ROOM: "bg-teal-100 text-teal-700",
  EQUIPMENT:    "bg-orange-100 text-orange-700",
};

const STATUS_BADGE = {
  AVAILABLE:         "bg-emerald-100 text-emerald-700",
  MAINTENANCE:    "bg-amber-100 text-amber-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-700",
};

const STATUS_DOT = {
  AVAILABLE:         "bg-emerald-500",
  MAINTENANCE:    "bg-amber-500",
  OUT_OF_SERVICE: "bg-red-500",
};

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB:          "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT:    "Equipment",
};

const DEFAULT_FILTERS = {
  name: "", type: "", location: "",
  minCapacity: "", maxCapacity: "",
  page: 0, size: 12,
  status: "AVAILABLE", 
};

// ── Main Component ────────────────────────────────────────────────────────────

const UserFacilitiesPage = () => {
  const [resources, setResources]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters]       = useState(DEFAULT_FILTERS);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
      );
      const res = await searchResources(params);
      const page = res.data.data;
      setResources(page.content);
      setPagination({
        totalPages:    page.totalPages,
        totalElements: page.totalElements,
        currentPage:   page.number,
      });
    } catch {
      setError("Failed to load facilities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handle = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value, page: 0 }));

  const hasFilters = filters.name || filters.type ||
                     filters.location || filters.minCapacity || filters.maxCapacity;

  const goToPage = (p) => setFilters((f) => ({ ...f, page: p }));

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900">Facilities & Resources</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Browse available rooms, labs, and equipment for booking.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={filters.name}
              onChange={handle("name")}
              placeholder="Search facilities..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-900/30 focus:border-primary-900"
            />
          </div>

          {/* Type */}
          <select
            value={filters.type}
            onChange={handle("type")}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30 bg-white min-w-36"
          >
            {TYPE_OPTIONS.map((o) => (
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

          {hasFilters && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
            >
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Location</label>
              <input
                value={filters.location}
                onChange={handle("location")}
                placeholder="e.g. Block A"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Min Capacity</label>
              <input
                type="number" min={1}
                value={filters.minCapacity}
                onChange={handle("minCapacity")}
                placeholder="e.g. 20"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Max Capacity</label>
              <input
                type="number" min={1}
                value={filters.maxCapacity}
                onChange={handle("maxCapacity")}
                placeholder="e.g. 100"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-900/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Type quick-filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {TYPE_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setFilters((f) => ({ ...f, type: o.value, page: 0 }))}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filters.type === o.value
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
            }`}
          >
            {o.value && <span className="mr-1">{TYPE_ICONS[o.value]}</span>}
            {o.label}
          </button>
        ))}
      </div>

      {/* Count */}
      {!loading && !error && (
        <p className="text-xs text-slate-500 mb-4 font-medium">
          {pagination.totalElements} {pagination.totalElements === 1 ? "facility" : "facilities"} available
        </p>
      )}

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

      {/* Empty */}
      {!loading && !error && resources.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏛️</p>
          <p className="text-slate-600 font-semibold">No facilities found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* Resource Grid */}
      {!loading && !error && resources.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r) => (
              <UserResourceCard
                key={r.id}
                resource={r}
                onClick={() => setSelectedResource(r)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 px-2">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </>
  );
};

// ── User Resource Card ────────────────────────────────────────────────────────

const UserResourceCard = ({ resource, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group"
  >
    {/* Banner */}
    <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex-shrink-0">
      {resource.imageUrl ? (
        <img src={resource.imageUrl} alt={resource.name}
          className="w-full h-full object-cover opacity-80" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-30 select-none">
            {TYPE_ICONS[resource.type]}
          </span>
        </div>
      )}
      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold ${TYPE_COLORS[resource.type]}`}>
        {TYPE_LABELS[resource.type]}
      </span>
    </div>

    {/* Content */}
    <div className="p-4 flex flex-col flex-1">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 flex-1 group-hover:text-primary-900 transition-colors">
          {resource.name}
        </h3>
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_BADGE[resource.status]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[resource.status]}`} />
          {resource.status === "AVAILABLE" ? "Available" : resource.status.replace(/_/g, " ")}
        </span>
      </div>

      {resource.description && (
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {resource.description}
        </p>
      )}

      <div className="mt-auto space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{resource.location}</span>
        </div>
        {resource.capacity && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span>Capacity: {resource.capacity}</span>
          </div>
        )}
        {resource.availableFrom && resource.availableTo && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span>{resource.availableFrom} – {resource.availableTo}</span>
          </div>
        )}
      </div>

      {/* View Details button */}
      <button className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300">
        View Details
      </button>
    </div>
  </div>
);

// ── Resource Detail Modal ─────────────────────────────────────────────────────

const ResourceDetailModal = ({ resource, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative rounded-t-2xl overflow-hidden">
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt={resource.name}
            className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl opacity-30">{TYPE_ICONS[resource.type]}</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <span className={`absolute bottom-4 left-4 px-3 py-1 rounded-lg text-xs font-bold ${TYPE_COLORS[resource.type]}`}>
          {TYPE_LABELS[resource.type]}
        </span>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-slate-900">{resource.name}</h2>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_BADGE[resource.status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[resource.status]}`} />
            {resource.status === "AVAILABLE" ? "Available" : resource.status.replace(/_/g, " ")}
          </span>
        </div>

        {resource.description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-5">{resource.description}</p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 font-medium mb-1">Location</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {resource.location}
            </p>
          </div>
          {resource.capacity && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 font-medium mb-1">Capacity</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {resource.capacity} people
              </p>
            </div>
          )}
          {resource.availableFrom && resource.availableTo && (
            <div className="bg-slate-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-slate-500 font-medium mb-1">Availability Window</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {resource.availableFrom} – {resource.availableTo}
              </p>
            </div>
          )}
        </div>

        {/* Book button — only if ACTIVE */}
        {resource.status === "AVAILABLE" ? (
          <button className="w-full py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors text-sm">
            Book This Resource
          </button>
        ) : (
          <div className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-400 text-center text-sm cursor-not-allowed">
            Currently Unavailable
          </div>
        )}
      </div>
    </div>
  </div>
);

export default UserFacilitiesPage;