import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  CalendarCheck, 
  MessagesSquare, 
  Settings,
  Search, 
  Bell, 
  Megaphone,
  LogOut, 
  Shield,
  ShieldCheck,
  Activity,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-[#162238] to-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 hidden md:flex animate-slide-right relative overflow-hidden">
        {/* Subtle decorative mesh overlay for the admin sidebar */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <ShieldCheck className="h-6 w-6 text-accent-emerald mr-2" />
          <span className="text-lg font-bold text-white tracking-tight">Hub Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="#" className="flex items-center px-4 py-3 bg-primary-900 text-white rounded-xl font-medium transition-all duration-300 shadow-sm shadow-blue-900/20 group hover:shadow-md hover:shadow-blue-900/40">
            <LayoutDashboard className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            Dashboard
          </a>
          <a href="#" className="group flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <MapPin className="h-5 w-5 mr-3 group-hover:scale-110 group-hover:text-accent-emerald transition-transform duration-300" />
            Facilities Catalogue
          </a>
          <a href="#" className="group flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <CalendarCheck className="h-5 w-5 mr-3 group-hover:scale-110 group-hover:text-accent-amber transition-transform duration-300" />
            All Bookings
          </a>
          <a href="#" className="group flex items-center px-4 py-3 hover:bg-slate-800/80 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <MessagesSquare className="h-5 w-5 mr-3 group-hover:scale-110 group-hover:text-red-400 transition-transform duration-300" />
            All Tickets
          </a>
          <a href="#" className="group flex items-center px-4 py-3 hover:bg-slate-800/80 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <Megaphone className="h-5 w-5 mr-3 group-hover:scale-110 group-hover:text-amber-400 transition-transform duration-300" />
            Manage Notifications
          </a>
          
          <div className="pt-4 mt-4 border-t border-slate-800/60">
            <a href="#" className="group flex items-center px-4 py-3 hover:bg-slate-800/80 hover:text-white text-slate-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
              <Settings className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-45" />
              System Settings
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <Link to="/login" className="group flex items-center px-4 py-3 text-slate-400 hover:bg-red-900/30 hover:text-red-400 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
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
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-900 focus:border-primary-900 sm:text-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300"
                placeholder="Search resources, users, or tickets..."
              />
            </div>
          </div>
          
          <div className="ml-4 flex items-center mb-0 space-x-4">
            <button className="p-2 text-slate-400 hover:text-primary-900 relative transition-colors duration-300 hover:scale-110">
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-accent-amber border-2 border-white animate-pulse"></span>
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center ml-2 cursor-pointer border-l border-slate-200 pl-4 py-1 group">
              <div className="text-right mr-3 hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-primary-900 transition-colors">Admin User</p>
                <p className="text-xs text-slate-500 mt-1">Superadmin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center border-2 border-slate-200 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:border-primary-100">
                <Shield className="h-5 w-5 text-accent-emerald" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between animate-slide-up">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
              <p className="text-slate-500 mt-1 font-medium">System-wide metrics and facility status.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                <Activity className="h-4 w-4 mr-1.5" />
                System Healthy
              </span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-75 group">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary-900 group-hover:scale-110 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">142</h3>
              <p className="text-slate-500 text-sm font-medium">Total Active Resources</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-150 group">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-accent-amber group-hover:scale-110 group-hover:bg-accent-amber group-hover:text-white transition-all duration-300">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Today</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">84</h3>
              <p className="text-slate-500 text-sm font-medium">Bookings Today</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <MessagesSquare className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">+5 New</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">17</h3>
              <p className="text-slate-500 text-sm font-medium">System-wide Open Tickets</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-300 group">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Active</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">2,405</h3>
              <p className="text-slate-500 text-sm font-medium">Total Registered Users</p>
            </div>
          </div>

          {/* Usage Analytics Grid (Placeholders) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-96 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up delay-400">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Peak Booking Hours</h2>
                <button className="text-slate-400 hover:text-primary-900 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
                <Activity className="h-10 w-10 text-slate-300 mb-2 relative z-10" />
                <p className="text-slate-400 font-medium relative z-10">Chart Placeholder</p>
                <p className="text-xs text-slate-400 mt-1 relative z-10">(Line Chart showing hourly volume)</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-96 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up delay-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Top Booked Resources</h2>
                <button className="text-slate-400 hover:text-primary-900 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary-900/5 to-transparent rounded-b-xl"></div>
                <div className="flex items-end space-x-4 h-32 relative z-10 px-4">
                  {/* Decorative bar chart placeholder */}
                  <div className="w-12 bg-blue-200 rounded-t-sm h-16"></div>
                  <div className="w-12 bg-primary-900 rounded-t-sm h-28 shadow-lg shadow-blue-900/20"></div>
                  <div className="w-12 bg-accent-emerald rounded-t-sm h-20"></div>
                  <div className="w-12 bg-accent-amber rounded-t-sm h-12"></div>
                  <div className="w-12 bg-blue-300 rounded-t-sm h-24"></div>
                </div>
                <p className="text-slate-400 font-medium mt-6 relative z-10">Chart Placeholder</p>
                <p className="text-xs text-slate-400 mt-1 relative z-10">(Bar Chart showing top 5 facilities)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
