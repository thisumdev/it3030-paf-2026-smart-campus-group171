import React from 'react';
import { 
  Home, 
  Calendar, 
  Ticket, 
  Search, 
  Bell, 
  LogOut, 
  User,
  Clock,
  AlertCircle,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-white via-slate-50/80 to-slate-100/50 border-r border-slate-200/60 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 animate-slide-right relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-900/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="h-16 flex items-center px-6 border-b border-slate-200/60 bg-white/40 backdrop-blur-sm">
          <ShieldCheck className="h-6 w-6 text-primary-900 mr-2" />
          <span className="text-lg font-bold text-primary-900 tracking-tight">Campus Hub</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="group flex items-center px-4 py-3 bg-primary-50 text-primary-900 rounded-xl font-medium transition-all duration-300 hover:shadow-sm">
            <Home className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            Home
          </a>
          <a href="#" className="group flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <Calendar className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300 text-slate-400 group-hover:text-primary-900" />
            My Bookings
          </a>
          <a href="#" className="group flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <Ticket className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300 text-slate-400 group-hover:text-primary-900" />
            My Tickets
          </a>
          <a href="#" className="group flex items-center px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <Bell className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300 text-slate-400 group-hover:text-primary-900" />
            Notifications
          </a>
        </nav>

        <div className="p-4 border-t border-slate-200/60 bg-slate-50/30">
          <Link to="/login" className="group flex items-center px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-medium transition-all duration-300 hover:translate-x-1">
            <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300 text-slate-400 group-hover:text-red-600" />
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
                placeholder="Search resources, tickets..."
              />
            </div>
          </div>
          
          <div className="ml-4 flex items-center mb-0 space-x-4">
            <button className="p-2 text-slate-400 hover:text-primary-900 relative transition-colors duration-300 hover:scale-110">
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center ml-2 cursor-pointer group">
              <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <User className="h-5 w-5 text-primary-900" />
              </div>
              <span className="ml-2 text-sm font-medium text-slate-700 hidden sm:block group-hover:text-primary-900 transition-colors">Jane Student</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, Jane! 👋</h1>
            <p className="text-slate-500 mt-1 font-medium">Here's what's happening with your campus activities.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-100 group">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-accent-amber group-hover:scale-110 group-hover:bg-accent-amber group-hover:text-white transition-all duration-300">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Today</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">2</h3>
              <p className="text-slate-500 text-sm font-medium">Pending Bookings</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Action Required</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">1</h3>
              <p className="text-slate-500 text-sm font-medium">Open Support Tickets</p>
            </div>

            {/* Card 3 (Action) */}
            <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 rounded-2xl p-6 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer border border-primary-700/50 text-white flex flex-col justify-center items-center text-center animate-slide-up delay-300">
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-500 opacity-20 rounded-full mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-accent-emerald opacity-20 rounded-full mix-blend-overlay"></div>
              
              <div className="relative z-10 h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md group-hover:scale-110 shadow-inner border border-white/20 transition-transform duration-300">
                <PlusCircle className="h-8 w-8 text-white drop-shadow-md" />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-wide relative z-10 drop-shadow-md group-hover:text-blue-50 transition-colors">Quick Book</h3>
              <p className="text-blue-100 font-medium text-sm mt-1 relative z-10 drop-shadow-sm">Reserve a room instantly</p>
            </div>
          </div>

          {/* Recent Activity Section Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 animate-slide-up delay-400">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <button className="text-sm font-semibold text-primary-900 hover:text-primary-800 transition-colors">View All</button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 hover:shadow-sm transition-all duration-300 cursor-pointer hover:pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-primary-900 mr-4">
                      {i === 2 ? <Ticket className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {i === 2 ? 'Submitted IT Support Ticket' : 'Booked Group Study Room'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Today at {10 - i}:30 AM</p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
