import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Dumbbell,
  History,
  BookOpen,
  Utensils,
  LineChart,
  Settings,
  LogOut,
  Flame,
  Menu,
  X
} from 'lucide-react';

export default function SidebarLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workout Tracker', path: '/workout', icon: Dumbbell },
    { name: 'Workout History', path: '/history', icon: History },
    { name: 'Exercise Library', path: '/exercises', icon: BookOpen },
    { name: 'Nutrition', path: '/nutrition', icon: Utensils },
    { name: 'Progress & Stats', path: '/progress', icon: LineChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#121212] border-r border-zinc-800 p-6 fixed inset-y-0 z-30">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#ccff00] rounded-xl flex items-center justify-center text-black shadow-lg shadow-[#ccff00]/20">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-lg text-white">ApexFit</h1>
            <p className="text-xs text-zinc-400">Pro Fitness Tracker</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/15 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-[#ccff00] uppercase text-sm border border-zinc-700">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between bg-[#121212] border-b border-zinc-800 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#ccff00] rounded-lg flex items-center justify-center text-black">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-white tracking-tight">ApexFit</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-[#0a0a0a]/95 z-50 p-6 flex flex-col justify-between backdrop-blur-xl">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-[#ccff00] text-black font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-[#ccff00] uppercase">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div>
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-zinc-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/40 text-red-400 font-medium border border-red-900/50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#121212]/95 border-t border-zinc-800 backdrop-blur-lg z-40 px-2 py-2 flex items-center justify-around">
        {[
          { name: 'Home', path: '/', icon: LayoutDashboard },
          { name: 'Workout', path: '/workout', icon: Dumbbell },
          { name: 'History', path: '/history', icon: History },
          { name: 'Nutrition', path: '/nutrition', icon: Utensils },
          { name: 'Progress', path: '/progress', icon: LineChart },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors ${
                  isActive ? 'text-[#ccff00] font-semibold' : 'text-zinc-400 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
