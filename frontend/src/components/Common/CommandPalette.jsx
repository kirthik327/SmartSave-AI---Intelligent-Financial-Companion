import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Flame, Eye, EyeOff, LayoutDashboard, Target, Sparkles, Trophy, Settings } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, onTogglePrivacyMode }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    { name: 'Go to Dashboard', action: () => navigate('/dashboard'), icon: LayoutDashboard },
    { name: 'Go to Savings Goals', action: () => navigate('/goals'), icon: Target },
    { name: 'Talk to AI Coach', action: () => navigate('/ai-coach'), icon: Sparkles },
    { name: 'View Active Challenges', action: () => navigate('/challenges'), icon: Trophy },
    { name: 'Update Preferences', action: () => navigate('/settings'), icon: Settings },
    { name: 'Toggle Privacy Mode (Hide Balance)', action: onTogglePrivacyMode, icon: user?.privacyMode ? Eye : EyeOff }
  ];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        filteredItems[activeIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-zinc-950/40 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200/40 dark:border-zinc-800/40">
          <Search size={18} className="text-zinc-400" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or page name..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            className="w-full bg-transparent border-none outline-none text-sm text-zinc-950 dark:text-zinc-50"
          />
          <button onClick={onClose} className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold cursor-pointer">ESC</button>
        </div>

        {/* Action Matches */}
        <div className="p-2 max-h-80 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
          {filteredItems.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No commands found matching "{query}"</p>
          ) : (
            filteredItems.map((item, idx) => (
              <button 
                key={item.name}
                onClick={() => { item.action(); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  idx === activeIndex 
                    ? 'bg-brand-emerald text-black shadow-lg font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </button>
            ))
          )}
        </div>

        {/* Shortcuts Footer */}
        <div className="px-5 py-3 border-t border-zinc-200/30 dark:border-zinc-800/30 bg-zinc-50/50 dark:bg-brand-cardDark/50 flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
          <div className="flex gap-4">
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[9px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[9px]">Enter</kbd> Execute</span>
          </div>
          <div className="flex gap-3">
            <span>Alt+D Dashboard</span>
            <span>Alt+G Goals</span>
            <span>Alt+H Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
