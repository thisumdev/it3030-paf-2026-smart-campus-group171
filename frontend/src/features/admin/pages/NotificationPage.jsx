// src/features/admin/pages/NotificationsPage.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Send,
  Bell,
  List,
  ChevronDown,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
  BookOpen,
  Ticket,
  Megaphone,
  Users,
  User,
  ShieldCheck,
  Globe,
  Loader2,
} from "lucide-react";
import {
  adminSendNotification,
  adminFetchAllNotifications,
  adminUpdateNotification,
  adminDeleteNotification,
} from "../../notifications/services/notificationApi";
import { fetchAllUsers } from "../user/services/adminApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const BOOKING_TYPES = [
  { value: "BOOKING_PENDING", label: "Booking Pending" },
  { value: "BOOKING_APPROVED", label: "Booking Approved" },
  { value: "BOOKING_REJECTED", label: "Booking Rejected" },
  { value: "BOOKING_CANCELLED", label: "Booking Cancelled" },
];

const TICKET_TYPES = [
  { value: "TICKET_OPEN", label: "Ticket Opened" },
  { value: "TICKET_IN_PROGRESS", label: "Ticket In Progress" },
  { value: "TICKET_RESOLVED", label: "Ticket Resolved" },
  { value: "TICKET_CLOSED", label: "Ticket Closed" },
  { value: "TICKET_REJECTED", label: "Ticket Rejected" },
  { value: "TICKET_ASSIGNED", label: "Technician Assigned" },
  { value: "TICKET_COMMENT_ADDED", label: "New Comment" },
];

const TARGET_MODES = [
  { value: "USER", label: "Individual User", icon: User },
  { value: "SELECTED", label: "Selected Users", icon: Users },
  { value: "ROLE", label: "By Role", icon: ShieldCheck },
  { value: "ALL", label: "Everyone", icon: Globe },
];

const TYPE_BADGE = {
  BOOKING: "bg-amber-100 text-amber-800",
  TICKET: "bg-red-100 text-red-800",
  GENERAL: "bg-blue-100 text-blue-800",
};

const categoryMeta = {
  BOOKING: { icon: BookOpen, colour: "text-accent-amber" },
  TICKET: { icon: Ticket, colour: "text-red-500" },
  GENERAL: { icon: Megaphone, colour: "text-primary-900" },
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

const Toast = ({ msg, ok, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-up ${
        ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      {msg}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const [tab, setTab] = useState("send"); // "send" | "all"
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => setToast({ msg, ok });

  return (
    <>
      {/* Page header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-accent-amber" /> Manage Notifications
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Send targeted notifications and manage all platform alerts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "send", label: "Send Notification", icon: Send },
          { key: "all", label: "All Notifications", icon: List },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === key
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === "send" && <SendTab showToast={showToast} />}
      {tab === "all" && <AllTab showToast={showToast} />}

      {toast && (
        <Toast msg={toast.msg} ok={toast.ok} onDone={() => setToast(null)} />
      )}
    </>
  );
};

// ── Send Tab ──────────────────────────────────────────────────────────────────

const SendTab = ({ showToast }) => {
  const [circumstance, setCircumstance] = useState(null); // "BOOKING"|"TICKET"|"GENERAL"
  const [notifType, setNotifType] = useState("");
  const [targetMode, setTargetMode] = useState("USER");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");
  // recipient state
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedRole, setSelectedRole] = useState("USER");
  const [userSearch, setUserSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchAllUsers()
      .then((data) => {
        // data might be wrapped in HATEOAS — flatten
        const users = data?.content ?? (Array.isArray(data) ? data : []);
        setAllUsers(users);
      })
      .catch(() => {});
  }, []);

  const filteredUsers = allUsers.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const typeOptions =
    circumstance === "BOOKING"
      ? BOOKING_TYPES
      : circumstance === "TICKET"
        ? TICKET_TYPES
        : [];

  const canProceed = () => {
    if (!circumstance) return false;
    if (circumstance !== "GENERAL" && !notifType) return false;
    if (!title.trim() || !message.trim()) return false;
    if (targetMode === "USER" && !selectedUserId) return false;
    if (targetMode === "SELECTED" && selectedUserIds.length === 0) return false;
    return true;
  };

  const buildPayload = () => ({
    title: title.trim(),
    message: message.trim(),
    targetType: targetMode,
    type: circumstance === "GENERAL" ? "GENERAL" : notifType,
    userId: targetMode === "USER" ? Number(selectedUserId) : undefined,
    userIds: targetMode === "SELECTED" ? selectedUserIds : undefined,
    role: targetMode === "ROLE" ? selectedRole : undefined,
    referenceId: referenceId ? Number(referenceId) : undefined,
    referenceType: circumstance !== "GENERAL" ? circumstance : undefined,
  });

  const handleSend = async () => {
    setSending(true);
    setShowConfirm(false);
    try {
      await adminSendNotification(buildPayload());
      showToast("Notification(s) sent successfully!");
      // Reset
      setCircumstance(null);
      setNotifType("");
      setTitle("");
      setMessage("");
      setReferenceId("");
      setSelectedUserId("");
      setSelectedUserIds([]);
    } catch (e) {
      showToast(
        e?.response?.data?.message ?? "Failed to send notification",
        false,
      );
    } finally {
      setSending(false);
    }
  };

  const toggleSelectedUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left — steps */}
      <div className="lg:col-span-2 space-y-5">
        {/* Step 1 — Circumstance */}
        <div className="premium-glass rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
            Step 1 — What type of notification?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                key: "BOOKING",
                label: "Booking",
                icon: BookOpen,
                colour: "amber",
              },
              { key: "TICKET", label: "Ticket", icon: Ticket, colour: "red" },
              {
                key: "GENERAL",
                label: "General",
                icon: Megaphone,
                colour: "blue",
              },
            ].map(({ key, label, icon: Icon, colour }) => (
              <button
                key={key}
                onClick={() => {
                  setCircumstance(key);
                  setNotifType("");
                  setTitle("");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  circumstance === key
                    ? `border-${colour}-400 bg-${colour}-50`
                    : "border-slate-100 hover:border-slate-300"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${circumstance === key ? `text-${colour}-600` : "text-slate-400"}`}
                />
                <span
                  className={`text-sm font-semibold ${circumstance === key ? `text-${colour}-700` : "text-slate-600"}`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Sub-type (Booking / Ticket only) */}
        {circumstance && circumstance !== "GENERAL" && (
          <div className="premium-glass rounded-2xl p-6 animate-slide-up">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
              Step 2 — Notification event
            </h2>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setNotifType(opt.value);
                    setTitle(opt.label);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    notifType === opt.value
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Title / Message / Reference */}
        {(circumstance === "GENERAL" || notifType) && (
          <div className="premium-glass rounded-2xl p-6 animate-slide-up space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Step {circumstance === "GENERAL" ? "2" : "3"} — Compose
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="Notification title..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 resize-none"
                placeholder="Write your notification message..."
              />
            </div>
            {circumstance !== "GENERAL" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reference ID{" "}
                  <span className="font-normal text-slate-400">
                    (optional — booking or ticket ID)
                  </span>
                </label>
                <input
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  type="number"
                  className="w-48 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
                  placeholder="e.g. 42"
                />
              </div>
            )}
          </div>
        )}

        {/* Step — Target (General always shows; Booking/Ticket when type chosen) */}
        {(circumstance === "GENERAL" || notifType) && (
          <div className="premium-glass rounded-2xl p-6 animate-slide-up">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
              Step {circumstance === "GENERAL" ? "3" : "4"} — Recipients
            </h2>

            {/* For booking/ticket — single user only */}
            {circumstance !== "GENERAL" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Select recipient user
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
                    placeholder="Search by name or email..."
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUserId(String(u.id))}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        selectedUserId === String(u.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="font-medium text-slate-800">
                        {u.fullName}
                      </span>
                      <span className="text-xs text-slate-400">{u.email}</span>
                      {selectedUserId === String(u.id) && (
                        <Check className="h-4 w-4 text-primary-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // General — all 4 target modes
              <div className="space-y-4">
                {/* Mode picker */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TARGET_MODES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTargetMode(value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                        targetMode === value
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>

                {/* USER */}
                {targetMode === "USER" && (
                  <div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
                        placeholder="Search user..."
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUserId(String(u.id))}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 ${
                            selectedUserId === String(u.id) ? "bg-blue-50" : ""
                          }`}
                        >
                          <span className="font-medium">{u.fullName}</span>
                          <span className="text-xs text-slate-400">
                            {u.email}
                          </span>
                          {selectedUserId === String(u.id) && (
                            <Check className="h-4 w-4 text-primary-900" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SELECTED */}
                {targetMode === "SELECTED" && (
                  <div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
                        placeholder="Search users..."
                      />
                    </div>
                    <p className="text-xs text-slate-400 mb-1">
                      {selectedUserIds.length} selected
                    </p>
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => toggleSelectedUser(u.id)}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 ${
                            selectedUserIds.includes(u.id) ? "bg-blue-50" : ""
                          }`}
                        >
                          <span className="font-medium">{u.fullName}</span>
                          <span className="text-xs text-slate-400">
                            {u.email}
                          </span>
                          {selectedUserIds.includes(u.id) && (
                            <Check className="h-4 w-4 text-primary-900" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROLE */}
                {targetMode === "ROLE" && (
                  <div className="flex gap-2">
                    {["USER", "ADMIN", "TECHNICIAN"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRole(r)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          selectedRole === r
                            ? "bg-slate-900 text-white border-slate-900"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                {/* ALL — no extra input needed */}
                {targetMode === "ALL" && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    This will send to all registered users on the platform.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — preview + send */}
      <div className="space-y-4">
        <div className="premium-glass rounded-2xl p-5 sticky top-24">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Preview</h3>
          {!circumstance ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Select a notification type to preview
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {circumstance === "BOOKING" && (
                  <BookOpen className="h-4 w-4 text-accent-amber" />
                )}
                {circumstance === "TICKET" && (
                  <Ticket className="h-4 w-4 text-red-500" />
                )}
                {circumstance === "GENERAL" && (
                  <Megaphone className="h-4 w-4 text-primary-900" />
                )}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    TYPE_BADGE[circumstance] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {notifType || circumstance}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{title || "—"}</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {message || "—"}
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 space-y-1">
                <p>
                  To:{" "}
                  <span className="font-semibold text-slate-600">
                    {circumstance !== "GENERAL"
                      ? selectedUserId
                        ? (allUsers.find((u) => String(u.id) === selectedUserId)
                            ?.fullName ?? "Selected user")
                        : "—"
                      : targetMode === "USER"
                        ? (allUsers.find((u) => String(u.id) === selectedUserId)
                            ?.fullName ?? "—")
                        : targetMode === "SELECTED"
                          ? `${selectedUserIds.length} user(s)`
                          : targetMode === "ROLE"
                            ? `All ${selectedRole}s`
                            : "Everyone"}
                  </span>
                </p>
                {referenceId && (
                  <p>
                    Ref ID:{" "}
                    <span className="font-semibold text-slate-600">
                      #{referenceId}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            disabled={!canProceed() || sending}
            onClick={() => setShowConfirm(true)}
            className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Confirm Send
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Are you sure you want to send this notification? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── All Notifications Tab ─────────────────────────────────────────────────────

const AllTab = ({ showToast }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRead, setFilterRead] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMsg, setEditMsg] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchAllNotifications({
        userId: filterUser || null,
        type: filterType || null,
        isRead: filterRead === "" ? null : filterRead === "true",
      });
      setNotifications(data);
    } catch {
      showToast("Failed to load notifications", false);
    } finally {
      setLoading(false);
    }
  }, [filterUser, filterType, filterRead]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = async (id) => {
    try {
      await adminUpdateNotification(id, { title: editTitle, message: editMsg });
      showToast("Notification updated");
      setEditId(null);
      load();
    } catch {
      showToast("Update failed", false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteNotification(id);
      showToast("Notification deleted");
      setDeleteId(null);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      showToast("Delete failed", false);
    }
  };

  const allTypeValues = [
    ...BOOKING_TYPES.map((t) => t.value),
    ...TICKET_TYPES.map((t) => t.value),
    "GENERAL",
  ];

  return (
    <div className="premium-glass rounded-2xl overflow-hidden">
      {/* Filter bar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
        <input
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          type="number"
          placeholder="Filter by User ID..."
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 w-40"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
        >
          <option value="">All Types</option>
          {allTypeValues.map((v) => (
            <option key={v} value={v}>
              {v.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-900"
        >
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        <button
          onClick={load}
          className="px-4 py-1.5 bg-slate-900 text-white text-sm rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Apply
        </button>
        <span className="ml-auto text-xs text-slate-400">
          {notifications.length} results
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          No notifications found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {[
                  "ID",
                  "User ID",
                  "Category",
                  "Title",
                  "Message",
                  "Read",
                  "Sent",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notifications.map((n) => {
                const meta = categoryMeta[n.category] ?? categoryMeta.GENERAL;
                const Icon = meta.icon;
                return (
                  <tr
                    key={n.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                      #{n.id}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{n.userId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${TYPE_BADGE[n.category]}`}
                      >
                        <Icon className="h-3 w-3" /> {n.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 max-w-[150px] truncate">
                      {editId === n.id ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none"
                        />
                      ) : (
                        n.title
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px]">
                      {editId === n.id ? (
                        <input
                          value={editMsg}
                          onChange={(e) => setEditMsg(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs focus:outline-none"
                        />
                      ) : (
                        <span className="line-clamp-2">{n.message}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          n.isRead
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {n.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {timeAgo(n.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {editId === n.id ? (
                          <>
                            <button
                              onClick={() => handleEdit(n.id)}
                              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditId(n.id);
                                setEditTitle(n.title);
                                setEditMsg(n.message);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(n.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Delete Notification
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete the notification. This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
