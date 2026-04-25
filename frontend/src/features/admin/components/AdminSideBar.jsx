import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  ClipboardCheck,
  MessagesSquare,
  Megaphone,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
  BarChart2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    hoverColor: "",
  },
  {
    to: "/admin/users",
    label: "User Management",
    Icon: Users,
    hoverColor: "group-hover:text-purple-400",
  },
  {
    to: "/admin/facilities",
    label: "Facilities Catalogue",
    Icon: MapPin,
    hoverColor: "group-hover:text-accent-emerald",
  },
  {
    to: "/admin/facilities/analytics",
    label: "Usage Analytics",
    Icon: BarChart2,
    hoverColor: "group-hover:text-accent-emerald",
    indent: true,   // visually nested under Facilities
  },
  {
    to: "/admin/bookings",
    label: "All Bookings",
    Icon: CalendarCheck,
    hoverColor: "group-hover:text-accent-amber",
  },
  {
    to: "/admin/bookings/checkins",
    label: "Check-in Records",
    Icon: ClipboardCheck,
    hoverColor: "group-hover:text-accent-amber",
    indent: true,
  },
  {
    to: "/admin/bookings/analytics",
    label: "Booking Analytics",
    Icon: BarChart2,
    hoverColor: "group-hover:text-accent-amber",
    indent: true,
  },
  {
    to: "/admin/tickets",
    label: "All Tickets",
    Icon: MessagesSquare,
    hoverColor: "group-hover:text-red-400",
  },
  {
    to: "/admin/notifications",
    label: "Manage Notifications",
    Icon: Megaphone,
    hoverColor: "group-hover:text-amber-400",
  },
];

const AdminSidebar = () => {
  const { logout } = useAuth();

  // Split: main nav (first 8) vs system section (notifications)
  const mainNav   = NAV_ITEMS.slice(0, 8);
  const systemNav = NAV_ITEMS.slice(8);

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-[#162238] to-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 hidden md:flex animate-slide-right relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <ShieldCheck className="h-6 w-6 text-accent-emerald mr-2" />
        <span className="text-lg font-bold text-white tracking-tight">Hub Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {mainNav.map(({ to, label, Icon, hoverColor, indent }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin/facilities"} // exact match so analytics doesn't also highlight Facilities
            className={({ isActive }) =>
              [
                indent ? "ml-4" : "",
                isActive
                  ? "flex items-center px-4 py-2.5 bg-slate-800 text-white rounded-xl font-medium shadow-sm group"
                  : "group flex items-center px-4 py-2.5 hover:bg-slate-800 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1",
              ].join(" ")
            }
          >
            <Icon
              className={`h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300 ${hoverColor} ${indent ? "opacity-70" : ""}`}
            />
            <span className={indent ? "text-sm" : ""}>{label}</span>
          </NavLink>
        ))}

        {/* System section */}
        <div className="pt-4 mt-4 border-t border-slate-800/60 space-y-1">
          {systemNav.map(({ to, label, Icon, hoverColor }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center px-4 py-2.5 bg-slate-800 text-white rounded-xl font-medium shadow-sm group"
                  : "group flex items-center px-4 py-2.5 hover:bg-slate-800/80 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1"
              }
            >
              <Icon
                className={`h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300 ${hoverColor}`}
              />
              {label}
            </NavLink>
          ))}

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive
                ? "flex items-center px-4 py-2.5 bg-slate-800 text-white rounded-xl font-medium shadow-sm group"
                : "group flex items-center px-4 py-2.5 hover:bg-slate-800/80 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1"
            }
          >
            <Settings className="h-4 w-4 mr-3 group-hover:scale-110 group-hover:rotate-45 transition-all duration-300" />
            System Settings
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={logout}
          className="group flex items-center w-full px-4 py-3 text-slate-400 hover:bg-red-900/30 hover:text-red-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1"
        >
          <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;