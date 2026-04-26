import { Clock, AlertCircle, PlusCircle, Calendar } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings } from "../../../api/bookingApi";

const STATUS_BADGE = {
  APPROVED:  "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING:   "border-amber-200 bg-amber-50 text-amber-700",
  REJECTED:  "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-500",
};

const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1)   return "Just now";
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const UserDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getMyBookings()
      .then((res) => {
        const data = res.data.data || res.data || [];
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount   = bookings.filter(b => b.status === "PENDING").length;
  const recentActivity = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Here's what's happening with your campus activities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        {/* Pending Bookings */}
        <div
          onClick={() => navigate("/user/bookings")}
          className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-accent-amber group-hover:scale-110 group-hover:bg-accent-amber group-hover:text-white transition-all duration-300 shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50">
              Today
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            {loading ? "—" : pendingCount}
          </h3>
          <p className="text-slate-500 text-sm font-medium">Pending Bookings</p>
        </div>

        {/* Open Tickets */}
        <div className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100/50">
              Action Required
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">—</h3>
          <p className="text-slate-500 text-sm font-medium">Open Support Tickets</p>
        </div>

        {/* Quick Book */}
        <div
          onClick={() => navigate("/user/facilities")}
          className="premium-glass rounded-2xl p-6 overflow-hidden relative group cursor-pointer animate-slide-up delay-300 flex flex-col justify-center items-center text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-indigo-900 group-hover:from-primary-900 group-hover:to-indigo-800 transition-colors duration-500" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent-amber opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-emerald opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md group-hover:scale-110 shadow-inner border border-white/20 transition-transform duration-500">
            <PlusCircle className="h-8 w-8 text-white drop-shadow-md group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-wide relative z-10 drop-shadow-md">
            Quick Book
          </h3>
          <p className="text-blue-100 font-medium text-sm mt-1 relative z-10 drop-shadow-sm">
            Reserve a room instantly
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="premium-glass p-6 rounded-2xl group animate-slide-up delay-400">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <button
            onClick={() => navigate("/user/bookings")}
            className="text-sm font-semibold text-primary-900 hover:text-primary-800 transition-colors"
          >
            View All
          </button>
        </div>

        {loading && (
          <p className="text-sm text-slate-400 text-center py-6">Loading...</p>
        )}

        {!loading && recentActivity.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-slate-500 text-sm font-medium">No bookings yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Go to Facilities to make your first booking.
            </p>
          </div>
        )}

        {!loading && recentActivity.length > 0 && (
          <div className="space-y-4">
            {recentActivity.map((booking) => (
              <div
                key={booking.id}
                onClick={() => navigate("/user/bookings")}
                className="group/item flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-300 cursor-pointer hover:pl-6"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-primary-900 mr-4 group-hover/item:scale-110 group-hover/item:bg-primary-900 group-hover/item:text-white transition-all duration-300 shadow-sm">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover/item:text-primary-900 transition-colors duration-200">
                      Booked {booking.resourceName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatRelativeTime(booking.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[booking.status]}`}>
                  {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
