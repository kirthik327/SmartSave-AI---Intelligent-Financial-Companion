import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Activity, Users, DollarSign, Send, ShieldAlert } from 'lucide-react';

export const AdminPanel = () => {
  const { apiRequest, formatCurrency } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [alertTitle, setAlertTitle] = useState('');
  const [alertBody, setAlertBody] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');
  const [alertError, setAlertError] = useState('');

  const fetchAdminStats = async () => {
    try {
      const data = await apiRequest('/api/admin/dashboard');
      setAdminData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    setAlertSuccess('');
    setAlertError('');
    if (!alertTitle || !alertBody) return;

    try {
      const res = await apiRequest('/api/admin/broadcast', 'POST', {
        title: alertTitle,
        body: alertBody
      });
      setAlertSuccess(res.message);
      setAlertTitle('');
      setAlertBody('');
      fetchAdminStats(); // refresh security logs
    } catch (err) {
      setAlertError(err.message || 'Broadcast failed');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-bgDark text-zinc-50">
        <Activity className="animate-spin text-brand-emerald" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-[10px] text-rose-500 font-mono tracking-widest uppercase">Root Security Console</span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-1">Admin Panel</h2>
      </div>

      {adminData && (
        <div className="flex flex-col gap-8">
          
          {/* KPI Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Platform Users</span>
              <h3 className="text-2xl font-extrabold mt-1">{adminData.metrics.totalUsers}</h3>
              <p className="text-[10px] text-brand-emerald mt-1 font-semibold">● {adminData.metrics.activeUsersToday} Active today</p>
            </div>

            <div className="grid-cols-1 p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Total Cash Ledger</span>
              <h3 className="text-2xl font-extrabold mt-1">{formatCurrency(adminData.metrics.totalPlatformBalance)}</h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Platform aggregate cash</p>
            </div>

            <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Platform Savings</span>
              <h3 className="text-2xl font-extrabold mt-1">{formatCurrency(adminData.metrics.totalPlatformSavings)}</h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Accumulated savings deposits</p>
            </div>

            <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Uptime & Health</span>
              <h3 className="text-2xl font-extrabold mt-1 text-brand-emerald">{adminData.health.serverStatus}</h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Uptime: {adminData.health.uptime}</p>
            </div>
          </div>

          {/* Broadcast & Security logs grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* System broadcast alert form */}
            <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                <Send size={14} />
                <span>Broadcast System Announcement</span>
              </h4>
              
              {alertSuccess && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-brand-emerald/20 text-brand-emerald text-xs font-semibold">
                  {alertSuccess}
                </div>
              )}
              {alertError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  {alertError}
                </div>
              )}

              <form onSubmit={handleBroadcastAlert} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Alert Title</label>
                  <input 
                    type="text" 
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="System Maintenance Scheduled"
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Message Description</label>
                  <textarea 
                    value={alertBody}
                    onChange={(e) => setAlertBody(e.target.value)}
                    placeholder="SmartSave server clusters will perform database schema patches at 3:00 AM IST."
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald h-24 resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="py-3 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer"
                >
                  Broadcast Bulletin
                </button>
              </form>
            </div>

            {/* Security Logs list */}
            <div className="lg:col-span-2 p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col h-[400px]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-500" />
                <span>Active Security Audits</span>
              </h4>

              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                {adminData.recentLogs.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-10 text-center font-semibold">No security events triggered.</p>
                ) : (
                  adminData.recentLogs.map((log) => (
                    <div key={log._id} className="p-3.5 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck size={12} />
                      </div>
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-400 font-mono">{log.type}</span>
                        <p className="text-xs text-zinc-300 mt-1.5 font-semibold">{log.message}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
