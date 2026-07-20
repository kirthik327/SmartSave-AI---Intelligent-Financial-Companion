import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Coins, Award, Sparkles, Plus, Check } from 'lucide-react';

export const Gamification = () => {
  const { user, challenges, badges, claimChallenge, addCustomChallengeItem, formatCurrency } = useAuth();
  
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [custTitle, setCustTitle] = useState('');
  const [custTarget, setCustTarget] = useState('');
  const [custXp, setCustXp] = useState('20');
  const [custError, setCustError] = useState('');

  // Daily checklist mockup items
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Review daily financial quotes', done: true },
    { id: 2, text: 'Log at least one transaction', done: false },
    { id: 3, text: 'Save ₹50 towards goal objectives', done: false }
  ]);

  const handleToggleChecklist = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const handleClaimReward = async (challengeId) => {
    try {
      await claimChallenge(challengeId);
      // Small local coin splash could be done, state refreshes automatically
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomChallenge = async (e) => {
    e.preventDefault();
    setCustError('');
    if (!custTitle || !custTarget) return setCustError('Title and target are required');

    try {
      await addCustomChallengeItem({
        title: custTitle,
        target: parseFloat(custTarget),
        xpReward: parseInt(custXp),
        type: 'daily'
      });
      setShowAddCustom(false);
      setCustTitle('');
      setCustTarget('');
    } catch (err) {
      setCustError(err.message || 'Failed to create challenge');
    }
  };

  // XP Progress formula
  const currentXp = user?.xp || 0;
  const level = user?.level || 1;
  const levelMaxXp = level * 100;
  const progressPct = Math.min(100, Math.ceil((currentXp % 100)));

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">Rewards & Milestones</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Challenges</h2>
        </div>
        
        {/* Animated Coins count */}
        <div className="flex items-center gap-2 px-4.5 py-2.5 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-glow-blue hover:scale-105 transition-all">
          <Coins className="text-brand-gold animate-bounce" size={18} />
          <span className="text-sm font-extrabold">{Math.floor((user?.xp || 0) / 4)} Coins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Streak & XP Level tracker */}
        <div className="flex flex-col gap-6">
          {/* Level Progress card */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 text-center relative overflow-hidden">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Level Status</span>
            <h3 className="text-4xl font-extrabold text-brand-emerald mt-2">Level {user?.level || 1}</h3>
            
            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-[10px] font-semibold mb-1 text-zinc-500">
                <span>{currentXp} Total XP</span>
                <span>{levelMaxXp} XP for Level Up</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-emerald to-brand-blue transition-all duration-500" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/5 rounded-full blur-xl"></div>
          </div>

          {/* Daily Streak tracker */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Saving Streak</h5>
              <p className="text-xs text-zinc-500 mt-1">Consistency is key to building wealth.</p>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Flame size={28} className="fill-orange-500 animate-pulse" />
              <span className="text-2xl font-extrabold">{user?.streak || 1}</span>
            </div>
          </div>

          {/* Daily Checklist Checklist */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Daily Checklist</h4>
            <div className="flex flex-col gap-3">
              {checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="w-full text-left flex items-center justify-between p-3.5 rounded-xl bg-zinc-100/50 dark:bg-brand-cardDark/50 border border-zinc-200/20 dark:border-brand-borderDark/20 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all cursor-pointer"
                >
                  <span className={`text-xs font-semibold ${item.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{item.text}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    item.done ? 'bg-brand-emerald border-brand-emerald text-black' : 'border-zinc-800 bg-transparent'
                  }`}>
                    {item.done && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Side: Active challenges */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Saving Challenges</h4>
              <button 
                onClick={() => setShowAddCustom(true)}
                className="text-xs text-brand-emerald hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Custom Challenge</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {challenges.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center font-semibold">No challenges set.</p>
              ) : (
                challenges.map(item => (
                  <div 
                    key={item._id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                      item.completed
                        ? 'bg-zinc-800/20 border-zinc-800/40 text-zinc-500'
                        : 'bg-zinc-100/50 dark:bg-brand-cardDark/50 border-zinc-200/20 dark:border-brand-borderDark/20'
                    }`}
                  >
                    <div>
                      <h5 className={`text-xs font-bold ${item.completed ? 'line-through' : 'text-zinc-800 dark:text-zinc-200'}`}>{item.title}</h5>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-purple">
                        <Sparkles size={12} />
                        <span>+{item.xpReward} XP</span>
                      </div>
                      
                      {!item.completed ? (
                        <button 
                          onClick={() => handleClaimReward(item._id)}
                          className="px-4 py-2 rounded-lg bg-brand-emerald hover:bg-brand-emeraldDark text-black text-[10px] font-bold shadow-glow-green cursor-pointer"
                        >
                          Complete
                        </button>
                      ) : (
                        <span className="text-[10px] font-extrabold text-brand-emerald px-3 py-1 rounded bg-brand-emerald/10 border border-brand-emerald/20">Claimed</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Badges Case Grid */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">Achievement Showcase</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {badges.map(badge => (
                <div 
                  key={badge.name} 
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all ${
                    badge.unlocked
                      ? 'border-brand-purple/20 bg-brand-purple/5 opacity-100'
                      : 'border-zinc-200/20 dark:border-brand-borderDark/20 bg-transparent opacity-40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    badge.unlocked ? 'bg-purple-500/10 text-brand-purple' : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    <Award size={24} />
                  </div>
                  <div>
                    <h6 className="text-[11px] font-bold truncate max-w-28 leading-none">{badge.name}</h6>
                    <p className="text-[9px] text-zinc-500 mt-1 leading-tight">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Challenge Modal */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-6">
            <h3 className="text-base font-extrabold mb-4">Establish Saving Challenge</h3>

            {custError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {custError}
              </div>
            )}

            <form onSubmit={handleAddCustomChallenge} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Challenge Name</label>
                <input 
                  type="text" 
                  value={custTitle}
                  onChange={(e) => setCustTitle(e.target.value)}
                  placeholder="Weekend Fasting (No Dining)"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Target Savings (₹)</label>
                  <input 
                    type="number" 
                    value={custTarget}
                    onChange={(e) => setCustTarget(e.target.value)}
                    placeholder="250"
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">XP Reward</label>
                  <select 
                    value={custXp}
                    onChange={(e) => setCustXp(e.target.value)}
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                  >
                    <option value="15">15 XP (Bronze)</option>
                    <option value="30">30 XP (Silver)</option>
                    <option value="50">50 XP (Gold)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowAddCustom(false)} className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer">
                  Launch Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
