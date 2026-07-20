import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Sun, Moon, Flame, ShieldAlert, Award, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onOpenCommandPalette }) => {
  const { user, notifications, markNotificationRead, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full glassmorphism border-b border-zinc-200/50 dark:border-brand-borderDark/50 px-6 py-4 flex items-center justify-between">
      {/* Search / Command Button */}
      <button 
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 p-2.5 md:px-4 md:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-brand-cardDark dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-brand-borderDark/40 text-sm text-zinc-500 w-11 h-11 md:w-64 text-left transition-all duration-200 cursor-pointer justify-center md:justify-start"
      >
        <Search size={16} className="shrink-0" />
        <span className="hidden md:inline">Search actions... (Ctrl+K)</span>
      </button>

      {/* Action Row */}
      <div className="flex items-center gap-2 md:gap-5">
        {/* Streak Indicator */}
        {user && (
          <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold text-xs md:text-sm">
            <Flame size={14} className="fill-orange-500 animate-pulse shrink-0" />
            <span>{user.streak || 1}<span className="hidden md:inline"> Day Streak</span></span>
          </div>
        )}

        {/* Level badge */}
        {user && (
          <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold text-xs md:text-sm">
            <Award size={14} className="shrink-0" />
            <span><span className="hidden md:inline">Lvl </span>{user.level || 1}</span>
          </div>
        )}

        {/* Theme Switcher */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-brand-cardDark hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-brand-borderDark/40 text-zinc-500 dark:text-zinc-400 cursor-pointer transition-all duration-200"
        >
          <Sun className="hidden dark:block text-amber-400" size={18} />
          <Moon className="block dark:hidden text-indigo-600" size={18} />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-brand-cardDark hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-brand-borderDark/40 text-zinc-500 dark:text-zinc-400 cursor-pointer relative transition-all duration-200"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl glassmorphism border border-zinc-200/80 dark:border-brand-borderDark/80 shadow-2xl p-4 max-h-96 overflow-y-auto no-scrollbar">
              <h4 className="font-bold text-sm mb-3">Reminders & Alerts</h4>
              <div className="flex flex-col gap-2.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map(item => (
                    <div 
                      key={item._id} 
                      className={`p-3 rounded-xl border transition-all ${
                        item.read 
                          ? 'bg-zinc-50/50 dark:bg-brand-cardDark/50 border-zinc-200/30 dark:border-zinc-800/30' 
                          : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/20 dark:border-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2 items-start">
                          {item.type === 'security' ? (
                            <ShieldAlert size={16} className="text-rose-500 mt-0.5" />
                          ) : (
                            <Award size={16} className="text-emerald-500 mt-0.5" />
                          )}
                          <div>
                            <h6 className="text-xs font-semibold">{item.title}</h6>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{item.body}</p>
                          </div>
                        </div>
                        {!item.read && (
                          <button 
                            onClick={() => markNotificationRead(item._id)}
                            className="text-[9px] text-brand-emerald hover:underline font-semibold cursor-pointer"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger */}
        {user && (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-brand-cardDark dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-brand-borderDark/40 cursor-pointer transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-emerald to-brand-blue flex items-center justify-center text-black font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-tight">{user.name}</p>
                <p className="text-[10px] text-zinc-500 leading-none">{user.email}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-48 rounded-xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-1.5 overflow-hidden">
                <button 
                  onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User size={14} />
                  <span>My Settings</span>
                </button>
                <hr className="my-1 border-zinc-200/40 dark:border-zinc-800/40" />
                <button 
                  onClick={() => { setShowProfileMenu(false); logout(); navigate('/login'); }}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-xs font-semibold text-rose-400 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
