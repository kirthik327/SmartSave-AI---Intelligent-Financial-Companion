import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, DollarSign, Lock, Trash2, Download, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { user, updateProfileSettings, logout } = useAuth();
  const navigate = useNavigate();

  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [goalLock, setGoalLock] = useState(user?.goalLockEnabled || false);
  const [language, setLanguage] = useState(user?.language || 'en');
  const [notifications, setNotifications] = useState(
    user?.notifications || {
      billReminders: true,
      goalReminders: true,
      savingAlerts: true,
      aiAlerts: true
    }
  );

  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await updateProfileSettings({
        currency,
        goalLockEnabled: goalLock,
        language,
        notifications
      });
      setSuccessMsg('Preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportData = () => {
    // Export mock configuration file
    const dataStr = JSON.stringify(user, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'smartsave_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDeleteAccount = () => {
    // Confirm and logout
    if (window.confirm('Are you sure you want to permanently delete your SmartSave account? This cannot be undone.')) {
      logout();
      navigate('/signup');
    }
  };

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">System Customization</span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-1">Settings</h2>
      </div>

      <div className="max-w-2xl">
        {successMsg && (
          <div className="p-3.5 mb-6 text-xs font-semibold rounded-xl bg-emerald-500/10 border border-brand-emerald/20 text-brand-emerald">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          
          {/* General Configs */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <DollarSign size={14} />
              <span>General Settings</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Preferred Currency</label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                >
                  <option value="INR">INR (₹) Rupees</option>
                  <option value="USD">USD ($) Dollars</option>
                  <option value="EUR">EUR (€) Euros</option>
                  <option value="GBP">GBP (£) Pounds</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security lock Configs */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Lock size={14} />
              <span>Withdrawal Security Lock</span>
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold">Goal Lock Protection</h5>
                <p className="text-[10px] text-zinc-500 mt-0.5">Enforce a 24-hour security delay period on emergency withdrawals</p>
              </div>
              <button
                type="button"
                onClick={() => setGoalLock(!goalLock)}
                className={`w-12 h-6.5 rounded-full transition-all relative cursor-pointer ${
                  goalLock ? 'bg-brand-emerald' : 'bg-zinc-800'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-black absolute top-1 transition-all ${
                    goalLock ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notification toggles */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Bell size={14} />
              <span>Notification Preferences</span>
            </h4>
            
            <div className="flex flex-col gap-3">
              {[
                { key: 'billReminders', label: 'Bill Reminders', desc: 'Alert me 3 days before standard bills are due' },
                { key: 'goalReminders', label: 'Goal Progress Reports', desc: 'Send AI optimized milestones every Friday' },
                { key: 'savingAlerts', label: 'Streak Reminders', desc: 'Notify before streak reset window expires' },
                { key: 'aiAlerts', label: 'AI Coach Bulletins', desc: 'Overspending alerts and category cap warnings' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-zinc-200/10 dark:border-zinc-800/10 last:border-none">
                  <div>
                    <h5 className="text-xs font-bold">{item.label}</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotification(item.key)}
                    className={`w-12 h-6.5 rounded-full transition-all relative cursor-pointer ${
                      notifications[item.key] ? 'bg-brand-emerald' : 'bg-zinc-800'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-black absolute top-1 transition-all ${
                        notifications[item.key] ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone actions */}
          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Trash2 size={14} />
              <span>Danger Zone Preferences</span>
            </h4>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="flex-1 py-3 rounded-xl bg-brand-cardDark hover:bg-zinc-800 border border-brand-borderDark hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download size={14} />
                <span>Export Offline Data</span>
              </button>
              
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trash2 size={14} />
                <span>Delete Account Permanently</span>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="py-4.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer"
          >
            Save All Preferences
          </button>
        </form>
      </div>
    </div>
  );
};
