import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Ticket,
  MessageSquare,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  fetchTicketById,
  fetchComments,
  addComment,
  deleteComment,
} from "../services/ticketApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META = {
  OPEN:        { label: "Open",        cls: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-800" },
  RESOLVED:    { label: "Resolved",    cls: "bg-emerald-100 text-emerald-800" },
  CLOSED:      { label: "Closed",      cls: "bg-slate-100 text-slate-600" },
  REJECTED:    { label: "Rejected",    cls: "bg-red-100 text-red-800" },
};

const PRIORITY_META = {
  LOW:      { label: "Low",      cls: "bg-slate-100 text-slate-600" },
  MEDIUM:   { label: "Medium",   cls: "bg-amber-100 text-amber-800" },
  HIGH:     { label: "High",     cls: "bg-orange-100 text-orange-800" },
  CRITICAL: { label: "Critical", cls: "bg-red-100 text-red-800" },
};

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm text-slate-800 font-medium">{value || "—"}</span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);

  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadTicket = useCallback(async () => {
    setLoadingTicket(true);
    try {
      const data = await fetchTicketById(id);
      setTicket(data);
    } catch {
      setError("Could not load this ticket.");
    } finally {
      setLoadingTicket(false);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const data = await fetchComments(id);
      setComments(data);
    } catch {
      // non-fatal — show empty
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
    loadComments();
  }, [loadTicket, loadComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentError(null);
    setPosting(true);
    try {
      const newComment = await addComment(id, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch {
      setCommentError("Failed to post comment. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingId(commentId);
    try {
      await deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silently fail — comment stays visible
    } finally {
      setDeletingId(null);
    }
  };

  if (loadingTicket) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-red-500 gap-2">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm font-medium">{error ?? "Ticket not found."}</p>
        <button
          onClick={() => navigate("/user/tickets")}
          className="mt-2 text-xs text-slate-500 underline hover:text-slate-700"
        >
          Back to My Tickets
        </button>
      </div>
    );
  }

  const status = STATUS_META[ticket.status] ?? { label: ticket.status, cls: "bg-slate-100 text-slate-600" };
  const priority = PRIORITY_META[ticket.priority] ?? { label: ticket.priority, cls: "bg-slate-100 text-slate-600" };

  return (
    <>
      {/* Back nav */}
      <div className="mb-6 animate-slide-up">
        <button
          onClick={() => navigate("/user/tickets")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.cls}`}>
                {status.label}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priority.cls}`}>
                {priority.label}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {ticket.category?.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary-900 flex-shrink-0" />
              {ticket.title}
            </h1>
          </div>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            #{ticket.id} · {fmt(ticket.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-slide-up">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Resolution / rejection notes */}
          {(ticket.resolutionNotes || ticket.rejectionReason) && (
            <div
              className={`rounded-2xl border p-5 animate-slide-up ${
                ticket.rejectionReason
                  ? "bg-red-50 border-red-100"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <h2 className="text-sm font-bold mb-2 text-slate-700">
                {ticket.rejectionReason ? "Rejection Reason" : "Resolution Notes"}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {ticket.rejectionReason ?? ticket.resolutionNotes}
              </p>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-slide-up">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              Comments
              <span className="ml-1 text-xs font-semibold text-slate-400">
                ({comments.length})
              </span>
            </h2>

            {loadingComments ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No comments yet.
              </p>
            ) : (
              <div className="space-y-3 mb-5">
                {comments.map((c) => {
                  const isOwn =
                    user?.name === c.authorName || user?.fullName === c.authorName;
                  return (
                    <div
                      key={c.id}
                      className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="h-7 w-7 rounded-full bg-primary-900/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-primary-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-800">
                            {c.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {c.commentText}
                        </p>
                      </div>
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          disabled={deletingId === c.id}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                          aria-label="Delete comment"
                        >
                          {deletingId === c.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-colors"
              />
              <button
                type="submit"
                disabled={posting || !commentText.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-900 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-50"
              >
                {posting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            {commentError && (
              <p className="mt-2 text-xs text-red-600">{commentError}</p>
            )}
          </div>
        </div>

        {/* Right — metadata */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-slide-up">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Details</h2>
            <div className="space-y-4">
              <DetailRow label="Reported by" value={ticket.reporterName} />
              <DetailRow label="Resource" value={ticket.resourceName} />
              <DetailRow label="Assigned to" value={ticket.assigneeName ?? "Unassigned"} />
              <DetailRow
                label="Preferred contact"
                value={ticket.preferredContact}
              />
              <DetailRow label="Submitted" value={fmt(ticket.createdAt)} />
              {ticket.resolvedAt && (
                <DetailRow label="Resolved" value={fmt(ticket.resolvedAt)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetailPage;
