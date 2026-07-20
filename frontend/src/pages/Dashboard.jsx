import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Sparkles, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Coffee,
  Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

export const Dashboard = () => {
  const { 
    user, 
    stats, 
    transactions, 
    addTransaction, 
    deleteTransactionItem,
    updateProfileSettings, 
    formatCurrency 
  } = useAuth();
  
  const navigate = useNavigate();

  const [showAddTx, setShowAddTx] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('expense');
  const [txCategory, setTxCategory] = useState('Food');
  const [txError, setTxError] = useState('');
  const [txFilter, setTxFilter] = useState('all');

  const [dailyQuote, setDailyQuote] = useState({ quote: 'Save Rupee by Rupee, build wealth second by second.', author: 'SmartSave AI' });

  const quotes = [
    { quote: 'He who buys what he does not need, steals from himself.', author: 'Swedish Proverb' },
    { quote: 'Do not save what is left after spending; spend what is left after saving.', author: 'Warren Buffett' },
    { quote: 'A penny saved is a penny earned.', author: 'Benjamin Franklin' },
    { quote: 'Look after the pennies, and the pounds will look after themselves.', author: 'William Lowndes' }
  ];

  useEffect(() => {
    // Select daily random quote
    const rand = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(rand);
  }, []);

  const handleTogglePrivacy = async () => {
    if (!user) return;
    try {
      await updateProfileSettings({ privacyMode: !user.privacyMode });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTransactionSubmit = async (e) => {
    e.preventDefault();
    setTxError('');
    if (!txTitle || !txAmount) return setTxError('Please enter title and amount');
    
    try {
      await addTransaction({
        title: txTitle,
        amount: parseFloat(txAmount),
        type: txType,
        category: txCategory
      });
      setShowAddTx(false);
      setTxTitle('');
      setTxAmount('');
    } catch (err) {
      setTxError(err.message || 'Transaction failed');
    }
  };

  const displayVal = (val) => {
    if (user?.privacyMode) return '••••';
    return formatCurrency(val);
  };

  // Chart 1: Balance Trend Data
  const recentTxsReverse = [...transactions].reverse();
  let cumulativeBalance = stats?.balance || 10000;
  const balanceHistory = recentTxsReverse.map(t => {
    if (t.type === 'income') cumulativeBalance += t.amount;
    else if (t.type === 'expense' || t.type === 'save') cumulativeBalance -= t.amount;
    return cumulativeBalance;
  });

  const lineChartData = {
    labels: recentTxsReverse.map(t => new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })).slice(-7),
    datasets: [{
      label: 'Balance Trend',
      data: balanceHistory.slice(-7),
      fill: true,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 6,
    }]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c0c0f',
        borderColor: '#1e1e24',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#fafafa',
        titleFont: { family: 'Outfit', size: 11 },
        bodyFont: { family: 'Outfit', size: 11 },
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } } },
      y: { grid: { color: 'rgba(113, 113, 122, 0.08)' }, ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } } }
    }
  };

  // Chart 2: Category distribution Doughnut
  const categorySummary = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
  });

  const donutLabels = Object.keys(categorySummary);
  const donutValues = Object.values(categorySummary);

  const donutChartData = {
    labels: donutLabels.length > 0 ? donutLabels : ['Utilities', 'Dining', 'Grocery'],
    datasets: [{
      data: donutValues.length > 0 ? donutValues : [4000, 3000, 2000],
      backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#eab308', '#ec4899', '#f97316'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#a1a1aa', font: { family: 'Outfit', size: 10 } } },
      tooltip: {
        backgroundColor: '#0c0c0f',
        borderColor: '#1e1e24',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#fafafa',
        titleFont: { family: 'Outfit', size: 11 },
        bodyFont: { family: 'Outfit', size: 11 },
        padding: 10,
        displayColors: false
      }
    },
    cutout: '65%'
  };

  const filteredTransactions = transactions.filter(t => {
    if (txFilter === 'all') return true;
    if (txFilter === 'income') return t.type === 'income';
    if (txFilter === 'expense') return t.type === 'expense';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-4 md:p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Daily Motivation Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/20 text-xs font-semibold flex items-center justify-between text-brand-emerald">
        <div className="flex items-center gap-3">
          <Bookmark size={14} className="shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-none">"{dailyQuote.quote}" — <strong>{dailyQuote.author}</strong></span>
        </div>
        <button 
          onClick={handleTogglePrivacy}
          className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 hover:text-brand-emerald flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {user?.privacyMode ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{user?.privacyMode ? 'Reveal' : 'Privacy'}</span>
        </button>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Balance KPI */}
        <div className="p-4 md:p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col justify-between h-28 sm:h-36">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider">Available Cash</span>
            <TrendingUp size={14} className="text-brand-emerald shrink-0" />
          </div>
          <div>
            <h3 className="text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-1 md:mt-2 truncate">{displayVal(stats?.balance)}</h3>
            <p className="hidden sm:block text-[10px] text-zinc-400 mt-1 font-semibold">Allocated index deposits included</p>
          </div>
        </div>

        {/* Income KPI */}
        <div className="p-4 md:p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col justify-between h-28 sm:h-36">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider">Income Log</span>
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-brand-emerald shrink-0">
              <ArrowUpRight size={12} />
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-1 md:mt-2 truncate">{displayVal(stats?.income)}</h3>
            <p className="hidden sm:block text-[10px] text-zinc-400 mt-1 font-semibold">Active ledger streams</p>
          </div>
        </div>

        {/* Expenses KPI */}
        <div className="p-4 md:p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col justify-between h-28 sm:h-36">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider">Expenses</span>
            <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
              <ArrowDownRight size={12} />
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-1 md:mt-2 truncate">{displayVal(stats?.expenses)}</h3>
            <p className="hidden sm:block text-[10px] text-zinc-400 mt-1 font-semibold">All card payments & bills</p>
          </div>
        </div>

        {/* AI Health Score KPI */}
        <div className="p-4 md:p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col justify-between h-28 sm:h-36 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-brand-purple">AI Health</span>
            <Sparkles size={14} className="text-brand-purple animate-spin shrink-0" />
          </div>
          <div>
            <h3 className="text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-1 md:mt-2 text-brand-purple truncate">{stats?.aiScore || 75}/100</h3>
            <p className="hidden sm:block text-[10px] text-zinc-400 mt-1 font-semibold">Based on saving ratios</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Grid Split Content: Charts & Recent ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Visual Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Balance Trend Line chart */}
          <div className="p-4 md:p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 h-64 sm:h-80 flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-400">Balance History Trend</h4>
            <div className="flex-1 w-full relative">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Category distribution chart */}
          <div className="p-4 md:p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 h-64 sm:h-80 flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-zinc-400">Expense Category Distribution</h4>
            <div className="flex-1 w-full relative">
              <Doughnut data={donutChartData} options={donutChartOptions} />
            </div>
          </div>
        </div>

        {/* Ledger & Quick Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Quick Financial Actions</h4>
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                onClick={() => setShowAddTx(true)}
                className="p-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold transition-all shadow-glow-green cursor-pointer flex flex-col items-center gap-2"
              >
                <Plus size={18} />
                <span>Log Transaction</span>
              </button>
              
              <button 
                onClick={() => navigate('/ai-coach')}
                className="p-4 rounded-xl bg-brand-cardDark hover:bg-zinc-800 border border-brand-borderDark text-zinc-200 text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-2"
              >
                <Sparkles size={18} className="text-brand-purple" />
                <span>Consult Coach</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Transaction History</h4>
              
              {/* Filter toggler */}
              <select 
                value={txFilter} 
                onChange={(e) => setTxFilter(e.target.value)}
                className="text-[10px] bg-zinc-100 dark:bg-brand-cardDark border border-zinc-200/40 dark:border-brand-borderDark/40 rounded px-2 py-1 outline-none text-zinc-500 font-semibold"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto no-scrollbar max-h-96">
              {filteredTransactions.length === 0 ? (
                <p className="text-xs text-zinc-500 py-10 text-center font-semibold">No transactions logged yet.</p>
              ) : (
                filteredTransactions.map(tx => (
                  <div key={tx._id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-100/50 dark:bg-brand-cardDark/50 border border-zinc-200/20 dark:border-brand-borderDark/20 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'income' 
                          ? 'bg-emerald-500/10 text-brand-emerald' 
                          : tx.type === 'save' 
                            ? 'bg-blue-500/10 text-brand-blue'
                            : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{tx.title}</h6>
                        <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">{tx.category} • {new Date(tx.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold ${tx.type === 'income' ? 'text-brand-emerald' : 'text-zinc-300'}`}>
                        {tx.type === 'income' ? '+' : '-'}{displayVal(tx.amount)}
                      </span>
                      <button 
                        onClick={() => deleteTransactionItem(tx._id)}
                        className="block text-[9px] text-zinc-600 hover:text-rose-500 mt-1 cursor-pointer w-full text-right"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-6">
            <h3 className="text-base font-extrabold mb-4">Log Financial Transaction</h3>
            
            {txError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {txError}
              </div>
            )}

            <form onSubmit={handleAddTransactionSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Transaction Title</label>
                <input 
                  type="text" 
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  placeholder="Organic groceries"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Amount</label>
                  <input 
                    type="number" 
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Type</label>
                  <select 
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Category</label>
                <select 
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                >
                  <option value="Food">Food / Groceries</option>
                  <option value="Salary">Salary Credit</option>
                  <option value="Housing">Housing / Rent</option>
                  <option value="Utilities">Utilities / Bills</option>
                  <option value="Dining Out">Dining Out</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health / Gym</option>
                  <option value="General">General / Others</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddTx(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer"
                >
                  Log Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
