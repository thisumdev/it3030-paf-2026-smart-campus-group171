import {
  MapPin,
  CalendarCheck,
  MessagesSquare,
  Users,
  Activity,
  Settings,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Welcome */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            System-wide metrics and facility status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
            <Activity className="h-4 w-4 mr-1.5" />
            System Healthy
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-75">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary-900 group-hover:scale-110 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300 shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
              +12%
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            142
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            Total Active Resources
          </p>
        </div>

        <div className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-150">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-accent-amber group-hover:scale-110 group-hover:bg-accent-amber group-hover:text-white transition-all duration-300 shadow-sm">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50">
              Today
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            84
          </h3>
          <p className="text-slate-500 text-sm font-medium">Bookings Today</p>
        </div>

        <div className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100/50">
              +5 New
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            17
          </h3>
          <p className="text-slate-500 text-sm font-medium">Open Tickets</p>
        </div>

        <div className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
              Active
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            2,405
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            Total Registered Users
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-glass p-6 rounded-2xl flex flex-col h-96 group animate-slide-up delay-400">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Peak Booking Hours
            </h2>
            <Settings className="h-5 w-5 text-slate-400 group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div className="flex-1 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-slate-50">
            <Activity className="h-10 w-10 text-slate-300 mb-2 group-hover:text-primary-900 transition-colors duration-300" />
            <p className="text-slate-400 font-medium">Chart Placeholder</p>
            <p className="text-xs text-slate-400 mt-1">
              Line Chart — hourly volume
            </p>
          </div>
        </div>

        <div className="premium-glass p-6 rounded-2xl flex flex-col h-96 group animate-slide-up delay-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Top Booked Resources
            </h2>
            <Settings className="h-5 w-5 text-slate-400 group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div className="flex-1 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-slate-50">
            <div className="flex items-end space-x-4 h-32 px-4 group-hover:scale-105 transition-transform duration-500">
              <div className="w-12 bg-blue-200 rounded-t-sm h-16" />
              <div className="w-12 bg-primary-900 rounded-t-sm h-28 shadow-lg" />
              <div className="w-12 bg-accent-emerald rounded-t-sm h-20" />
              <div className="w-12 bg-accent-amber rounded-t-sm h-12" />
              <div className="w-12 bg-blue-300 rounded-t-sm h-24" />
            </div>
            <p className="text-slate-400 font-medium mt-6">Chart Placeholder</p>
            <p className="text-xs text-slate-400 mt-1">
              Bar Chart — top 5 facilities
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
