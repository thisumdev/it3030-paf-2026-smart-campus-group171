import { ClipboardList, Bell, Wrench } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";

const TechnicianDashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Welcome */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user?.fullName?.split(" ")[0]}! 🔧
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Here's your technician overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Assignments placeholder */}
        <div className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50">
              Coming Soon
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            —
          </h3>
          <p className="text-slate-500 text-sm font-medium">Assigned Tasks</p>
        </div>

        {/* Notifications placeholder */}
        <div className="premium-glass rounded-2xl p-6 flex flex-col group animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50">
              Coming Soon
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
            —
          </h3>
          <p className="text-slate-500 text-sm font-medium">Notifications</p>
        </div>

        {/* Role badge */}
        <div className="premium-glass rounded-2xl p-6 overflow-hidden relative group animate-slide-up delay-300 flex flex-col justify-center items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-indigo-900" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent-amber opacity-20 rounded-full blur-2xl" />
          <div className="relative z-10 h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md shadow-inner border border-white/20">
            <Wrench className="h-8 w-8 text-white drop-shadow-md" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-wide relative z-10 drop-shadow-md">
            Technician
          </h3>
          <p className="text-blue-100 font-medium text-sm mt-1 relative z-10 drop-shadow-sm">
            Maintenance & Support
          </p>
        </div>
      </div>
    </>
  );
};

export default TechnicianDashboard;
