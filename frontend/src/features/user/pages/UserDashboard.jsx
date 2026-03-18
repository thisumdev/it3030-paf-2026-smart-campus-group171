import { Clock, AlertCircle, PlusCircle, Calendar, Ticket } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";

const UserDashboard = () => {
  const { user } = useAuth();

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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-100 group">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-accent-amber group-hover:scale-110 group-hover:bg-accent-amber group-hover:text-white transition-all duration-300">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
              Today
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            2
          </h3>
          <p className="text-slate-500 text-sm font-medium">Pending Bookings</p>
        </div>

        {/* Open Tickets */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-200 group">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              Action Required
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            1
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            Open Support Tickets
          </p>
        </div>

        {/* Quick Book CTA */}
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 rounded-2xl p-6 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer border border-primary-700/50 text-white flex flex-col justify-center items-center text-center animate-slide-up delay-300">
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-500 opacity-20 rounded-full mix-blend-overlay" />
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-accent-emerald opacity-20 rounded-full mix-blend-overlay" />
          <div className="relative z-10 h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md group-hover:scale-110 shadow-inner border border-white/20 transition-transform duration-300">
            <PlusCircle className="h-8 w-8 text-white drop-shadow-md" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-wide relative z-10 drop-shadow-md group-hover:text-blue-50 transition-colors">
            Quick Book
          </h3>
          <p className="text-blue-100 font-medium text-sm mt-1 relative z-10 drop-shadow-sm">
            Reserve a room instantly
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 animate-slide-up delay-400">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <button className="text-sm font-semibold text-primary-900 hover:text-primary-800 transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 hover:shadow-sm transition-all duration-300 cursor-pointer hover:pl-6"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-primary-900 mr-4">
                  {i === 2 ? (
                    <Ticket className="h-5 w-5" />
                  ) : (
                    <Calendar className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {i === 2
                      ? "Submitted IT Support Ticket"
                      : "Booked Group Study Room"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Today at {10 - i}:30 AM
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Approved
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
