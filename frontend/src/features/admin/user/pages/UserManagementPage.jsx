import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Trash2,
  ShieldCheck,
  Wrench,
  RefreshCw,
  AlertTriangle,
  X,
  UserCheck,
  Filter,
} from "lucide-react";
import { useAuth } from "../../../auth/context/AuthContext";
import { fetchAllUsers, deleteUserById } from "../services/adminApi";

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    ADMIN: {
      cls: "bg-purple-100 text-purple-800 border border-purple-200",
      Icon: ShieldCheck,
    },
    TECHNICIAN: {
      cls: "bg-amber-100 text-amber-800 border border-amber-200",
      Icon: Wrench,
    },
    USER: {
      cls: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      Icon: UserCheck,
    },
  };
  const { cls, Icon } = map[role] ?? map.USER;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {role}
    </span>
  );
};

// ── Delete confirmation modal ─────────────────────────────────────────────────
const DeleteModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">Delete User</h3>
          <p className="text-sm text-slate-500 mt-1">
            You are about to permanently delete{" "}
            <span className="font-semibold text-slate-800">
              {user?.fullName}
            </span>{" "}
            ({user?.email}). This cannot be undone.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {loading ? "Deleting…" : "Delete User"}
        </button>
      </div>
    </div>
  </div>
);

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-orange-600",
];

const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserManagementPage = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers(
        roleFilter === "ALL" ? null : roleFilter,
      );
      setUsers(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load users. Please retry.",
      );
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q)
    );
  });

  const counts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    { USER: 0, ADMIN: 0, TECHNICIAN: 0 },
  );

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteUserById(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccessMsg(`User "${userToDelete.fullName}" deleted successfully.`);
      setUserToDelete(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Delete failed. Please try again.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Users</h2>
          <p className="text-slate-500 mt-1 text-sm">
            {loading
              ? "Loading…"
              : `${filteredUsers.length} of ${users.length} users shown`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            <Users className="h-3.5 w-3.5" />
            {users.length} Total
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <UserCheck className="h-3.5 w-3.5" />
            {counts.USER} Users
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {counts.ADMIN} Admins
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Wrench className="h-3.5 w-3.5" />
            {counts.TECHNICIAN} Technicians
          </span>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium animate-slide-up">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          {successMsg}
          <button
            onClick={() => setSuccessMsg(null)}
            className="ml-auto text-emerald-500 hover:text-emerald-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="premium-glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 animate-slide-up">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="block w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block flex-shrink-0" />
          {["ALL", "USER", "ADMIN", "TECHNICIAN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                roleFilter === r
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Table card */}
      <div className="premium-glass rounded-2xl overflow-hidden animate-slide-up">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading users…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="text-slate-700 font-semibold">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Users className="h-10 w-10 text-slate-200" />
            <p className="text-slate-500 font-medium">No users found.</p>
            {(searchQuery || roleFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("ALL");
                }}
                className="text-sm text-slate-400 hover:text-slate-700 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full ${getAvatarColor(
                            u.id,
                          )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}
                        >
                          {getInitials(u.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">
                            {u.fullName || "—"}
                          </p>
                          {u.id === user?.id && (
                            <span className="text-xs text-slate-400 mt-0.5">
                              you
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* ID */}
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      #{u.id}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {u.id === user?.id ? (
                        <span className="text-xs text-slate-300 italic">
                          current session
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setUserToDelete(u);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-600">
                  {filteredUsers.length}
                </span>{" "}
                user{filteredUsers.length !== 1 && "s"}
                {roleFilter !== "ALL" && (
                  <>
                    {" "}
                    with role{" "}
                    <span className="font-semibold text-slate-600">
                      {roleFilter}
                    </span>
                  </>
                )}
                {searchQuery && (
                  <>
                    {" "}
                    matching{" "}
                    <span className="font-semibold text-slate-600">
                      "{searchQuery}"
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {userToDelete && (
        <DeleteModal
          user={userToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setUserToDelete(null);
            setDeleteError(null);
          }}
          loading={deleteLoading}
        />
      )}

      {/* Error toast */}
      {deleteError && !userToDelete && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium shadow-xl animate-slide-up">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          {deleteError}
          <button
            onClick={() => setDeleteError(null)}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
};

export default UserManagementPage;
