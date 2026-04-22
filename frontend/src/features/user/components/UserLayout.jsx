import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import UserSidebar from "./UserSideBar";
import UserProfilePanel from "./UserProfilePanel"; // ← NEW
import NotificationBell from "../../notifications/components/NotificationBell";

const UserLayout = () => {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false); // ← NEW

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <UserSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden animate-fade-in">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shadow-sm z-10 sticky top-0">
          <div className="flex-1 flex max-w-2xl">
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-900 focus:border-primary-900 hover:bg-slate-50 hover:border-slate-300 sm:text-sm transition-all duration-300 shadow-sm"
                placeholder="Search resources, tickets..."
              />
            </div>
          </div>

          <div className="ml-4 flex items-center space-x-4">
            <NotificationBell />

            {/* ── Avatar button — opens profile panel ── */}
            <button
              onClick={() => setProfileOpen(true)}
              title="View profile"
              className="flex items-center ml-2 cursor-pointer border-l border-slate-200 pl-4 py-1 group"
            >
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center border-2 border-slate-200 shadow-sm transition-all duration-300 group-hover:scale-105">
                <User className="h-5 w-5 text-accent-amber" />
              </div>
              <span className="ml-2 text-sm font-medium text-slate-700 hidden sm:block group-hover:text-primary-900 transition-colors">
                {user?.fullName || "User"}
              </span>
            </button>
          </div>
        </header>

        {/* Page content renders here */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* ── Profile panel ── */}
      <UserProfilePanel
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
};

export default UserLayout;
