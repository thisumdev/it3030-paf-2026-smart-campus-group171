import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertCircle, LayoutGrid, List } from "lucide-react";
import { searchResources } from "../services/facilityApi";
import ResourceCard from "../components/ResourceCard";
import ResourceFormModal from "../components/ResourceFormModal";
import StatusChangeModal from "../components/StatusChangeModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ResourceFilterBar from "../components/ResourceFilterBar";

const DEFAULT_FILTERS = {
  name: "", type: "", status: "", location: "",
  minCapacity: "", maxCapacity: "", page: 0, size: 12,
};

const FacilitiesCataloguePage = () => {
  const [resources, setResources]       = useState([]);
  const [pagination, setPagination]     = useState({});
  const [filters, setFilters]           = useState(DEFAULT_FILTERS);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode]         = useState("grid");

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
      );
      const res  = await searchResources(params);
      const page = res.data.data;
      setResources(page.content);
      setPagination({
        totalPages:    page.totalPages,
        totalElements: page.totalElements,
        currentPage:   page.number,
        size:          page.size,
      });
    } catch {
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleSaved   = () => { setShowForm(false); setEditTarget(null); fetchResources(); };
  const handleDeleted = () => { setDeleteTarget(null); fetchResources(); };
  const handleStatusSaved = () => { setStatusTarget(null); fetchResources(); };
  const handleEdit    = (r) => { setEditTarget(r); setShowForm(true); };
  const goToPage      = (p) => setFilters((f) => ({ ...f, page: p }));

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facilities & Assets Catalogue</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage rooms, labs, and equipment available for booking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Resource
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <ResourceFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Summary */}
      {!loading && !error && (
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Showing {resources.length} of {pagination.totalElements} resources
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
          <p className="text-slate-600 font-semibold">No resources found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or add a new resource.</p>
        </div>
      )}

      {/* Grid / List */}
      {!loading && !error && resources.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  isAdmin
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onStatusChange={setStatusTarget}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((r) => (
                <ResourceListRow
                  key={r.id}
                  resource={r}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onStatusChange={setStatusTarget}
                />
              ))}
            </div>
          )}

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

      {/* Modals */}
      {showForm && (
        <ResourceFormModal
          resource={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}
      {statusTarget && (
        <StatusChangeModal
          resource={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={handleStatusSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          resource={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
};

// ── List Row ──────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  ACTIVE:         "bg-emerald-100 text-emerald-700",
  MAINTENANCE:    "bg-amber-100 text-amber-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-700",
};

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall", LAB: "Lab",
  MEETING_ROOM: "Meeting Room", EQUIPMENT: "Equipment",
};

const ResourceListRow = ({ resource, onEdit, onDelete, onStatusChange }) => (
  <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
      {resource.type === "LECTURE_HALL" && "🏛️"}
      {resource.type === "LAB"          && "🔬"}
      {resource.type === "MEETING_ROOM" && "🤝"}
      {resource.type === "EQUIPMENT"    && "📷"}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-slate-900 text-sm truncate">{resource.name}</p>
      <p className="text-xs text-slate-500">{resource.location}</p>
    </div>
    <span className="text-xs font-semibold text-slate-500 hidden sm:block">{TYPE_LABELS[resource.type]}</span>
    {resource.capacity && (
      <span className="text-xs text-slate-500 hidden md:block">{resource.capacity} seats</span>
    )}
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[resource.status]}`}>
      {resource.status.replace(/_/g, " ")}
    </span>
    <div className="flex items-center gap-1 ml-2">
      <button onClick={() => onEdit(resource)}
        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      <button onClick={() => onStatusChange(resource)}
        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
        </svg>
      </button>
      <button onClick={() => onDelete(resource)}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </div>
);

export default FacilitiesCataloguePage;