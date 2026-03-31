import {
  MapPin,
  Users,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ToggleLeft,
} from "lucide-react";
import { useState } from "react";

const TYPE_COLORS = {
  LECTURE_HALL: "bg-blue-100 text-blue-700",
  LAB:          "bg-purple-100 text-purple-700",
  MEETING_ROOM: "bg-teal-100 text-teal-700",
  EQUIPMENT:    "bg-orange-100 text-orange-700",
};

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB:          "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT:    "Equipment",
};

const STATUS_BADGE = {
  ACTIVE:         "bg-emerald-100 text-emerald-700",
  MAINTENANCE:    "bg-amber-100 text-amber-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-700",
};

const STATUS_DOT = {
  ACTIVE:         "bg-emerald-500",
  MAINTENANCE:    "bg-amber-500",
  OUT_OF_SERVICE: "bg-red-500",
};

const ResourceCard = ({ resource, onEdit, onDelete, onStatusChange, isAdmin }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image or gradient banner */}
      <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex-shrink-0">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-30 select-none">
              {resource.type === "LECTURE_HALL" && "🏛️"}
              {resource.type === "LAB"          && "🔬"}
              {resource.type === "MEETING_ROOM" && "🤝"}
              {resource.type === "EQUIPMENT"    && "📷"}
            </span>
          </div>
        )}

        {/* Type badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold ${TYPE_COLORS[resource.type]}`}
        >
          {TYPE_LABELS[resource.type]}
        </span>

        {/* Admin menu */}
        {isAdmin && (
          <div className="absolute top-3 right-3">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-8 w-8 rounded-lg bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 animate-fade-in">
                <button
                  onClick={() => { onEdit(resource); setMenuOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 gap-2"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => { onStatusChange(resource); setMenuOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 gap-2"
                >
                  <ToggleLeft className="h-3.5 w-3.5" /> Change Status
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => { onDelete(resource); setMenuOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 flex-1">
            {resource.name}
          </h3>
          <span
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_BADGE[resource.status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[resource.status]}`} />
            {resource.status.replace(/_/g, " ")}
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
              <span>
                {resource.availableFrom} – {resource.availableTo}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;