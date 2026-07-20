import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  Sparkles, 
  Trophy, 
  Image as ImageIcon, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'AI Coach', path: '/ai-coach', icon: Sparkles },
    { name: 'Challenges', path: '/challenges', icon: Trophy },
    { name: 'Dream Board', path: '/dream-board', icon: ImageIcon },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Security Center', path: '/security', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen glassmorphism border-r border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col justify-between p-6 shrink-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-blue flex items-center justify-center shadow-glow-green">
          <TrendingUp className="text-black font-extrabold" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">SmartSave <span className="text-brand-emerald">AI</span></h1>
          <span className="text-[10px] text-zinc-500 font-mono">v1.0.0 SANDBOX</span>
        </div>
      </div>

      {/* Main Links */}
      <nav className="flex-1 my-8 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-brand-emerald/10 to-brand-blue/5 border border-brand-emerald/20 text-brand-emerald dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* Admin Section */}
        {user?.isAdmin && (
          <>
            <hr className="my-3 border-zinc-200/40 dark:border-zinc-800/40" />
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-300 shadow-sm'
                    : 'text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 border border-transparent'
                }`
              }
            >
              <ShieldAlert size={18} />
              <span>Admin Console</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Mini Profile Footer */}
      {user && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100/50 dark:bg-brand-cardDark/50 border border-zinc-200/20 dark:border-brand-borderDark/20">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-emerald to-brand-blue flex items-center justify-center font-bold text-black text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h5 className="text-xs font-bold truncate leading-tight">{user.name}</h5>
            <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Tier: Master Saver</p>
          </div>
        </div>
      )}
    </aside>
  );
};
