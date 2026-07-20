import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bar, Line } from 'react-chartjs-2';
import { Printer, Calendar, TrendingUp } from 'lucide-react';

export const Reports = () => {
  const { transactions, formatCurrency } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  // 1. Category Bar Chart calculations
  const categories = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const barChartData = {
    labels: Object.keys(categories).length > 0 ? Object.keys(categories) : ['Housing', 'Food', 'Entertainment'],
    datasets: [{
      label: 'Expense by Category (₹)',
      data: Object.values(categories).length > 0 ? Object.values(categories) : [12000, 4800, 1500],
      backgroundColor: 'rgba(59, 130, 246, 0.45)',
      borderColor: '#3b82f6',
      borderWidth: 1.5,
      borderRadius: 6
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 10 }
    },
    scales: {
      x: { ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } }, grid: { display: false } },
      y: { ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } }, grid: { color: 'rgba(113, 113, 122, 0.08)' } }
    }
  };

  // 2. Net Cash flow Calculations
  const monthlyFlow = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    income: [30000, 32000, 31000, 35000, 38000, 42000],
    expense: [18000, 19500, 17200, 22000, 24000, 21500]
  };

  const lineChartData = {
    labels: monthlyFlow.labels,
    datasets: [
      {
        label: 'Income Flow',
        data: monthlyFlow.income,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: 'Expense Ledger',
        data: monthlyFlow.expense,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#a1a1aa', font: { family: 'Outfit', size: 10 } } }
    },
    scales: {
      x: { ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } }, grid: { display: false } },
      y: { ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } }, grid: { color: 'rgba(113, 113, 122, 0.08)' } }
    }
  };

  // 3. Heatmap calendar mockup grid (last 28 days)
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    // Generate dates
    const date = new Date(Date.now() - (27 - i) * 24 * 60 * 60 * 1000);
    // Random savings scale (0-3)
    const val = Math.floor(Math.random() * 4);
    return {
      day: date.getDate(),
      intensity: val
    };
  });

  const intensityColors = [
    'bg-zinc-800 border-zinc-700/20', // level 0 (no savings)
    'bg-emerald-950/40 border-emerald-900/30 text-emerald-400', // level 1
    'bg-emerald-800/40 border-emerald-700/40 text-emerald-300', // level 2
    'bg-brand-emerald border-brand-emeraldDark/30 text-black font-extrabold' // level 3 (max savings)
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Header section */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div>
          <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">Platform Analytics</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Financial Reports</h2>
        </div>
        <button
          onClick={handlePrint}
          className="px-5 py-3 rounded-xl bg-brand-cardDark hover:bg-zinc-800 border border-brand-borderDark hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <Printer size={16} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Expenses Bar Chart */}
        <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 h-80 flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Category Expenditures</h4>
          <div className="flex-1 w-full relative">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Net Flow line chart */}
        <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 h-80 flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Net Cash Stream</h4>
          <div className="flex-1 w-full relative">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Savings Heatmap calendar */}
        <div className="lg:col-span-2 p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Savings Heatmap Calendar</h4>
              <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Tracking deposits logged across the last 28 days</p>
            </div>
            <Calendar size={16} className="text-brand-emerald" />
          </div>

          {/* Grid maps */}
          <div className="grid grid-cols-7 gap-2 max-w-sm mx-auto">
            {heatmapDays.map((d, idx) => (
              <div 
                key={idx}
                className={`aspect-square rounded-lg border flex items-center justify-center text-xs transition-all ${intensityColors[d.intensity]}`}
              >
                {d.day}
              </div>
            ))}
          </div>

          {/* Legend keys */}
          <div className="flex justify-center gap-4 mt-6 text-[10px] text-zinc-500 font-semibold uppercase">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded border bg-zinc-800 border-zinc-700/20" />
              <span>No Deposit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded border bg-brand-emerald border-brand-emeraldDark/30" />
              <span>Goal Saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
