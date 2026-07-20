import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, ShieldCheck, ArrowRight, TrendingUp, DollarSign, Target, Play } from 'lucide-react';

export const Landing = () => {
  const [dailySavings, setDailySavings] = useState(100);
  const [years, setYears] = useState(5);
  const navigate = useNavigate();

  // Compound interest calculation (8% estimated return)
  const calculateAccumulated = () => {
    const daily = dailySavings;
    const days = years * 365;
    const monthlyRate = 0.08 / 12;
    const monthlyContribution = daily * 30.4;
    const months = years * 12;
    let total = 0;
    
    for (let m = 0; m < months; m++) {
      total = (total + monthlyContribution) * (1 + monthlyRate);
    }
    return Math.round(total);
  };

  const formattedAccumulated = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(calculateAccumulated());

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } }
  };

  return (
    <div className="min-h-screen bg-brand-bgDark text-zinc-50 radial-bg overflow-x-hidden">
      {/* Background Animated Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-emerald/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Landing Header */}
      <nav className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-blue flex items-center justify-center shadow-glow-green">
            <TrendingUp size={20} className="text-black" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">SmartSave <span className="text-brand-emerald">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold text-zinc-400 hover:text-zinc-50 transition-colors">Sign In</Link>
          <Link 
            to="/signup" 
            className="px-5 py-2.5 rounded-full bg-brand-emerald hover:bg-brand-emeraldDark text-black text-sm font-bold transition-all shadow-glow-green cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 pt-16 pb-24 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto"
        >
          {/* AI Badge Pill */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full glassmorphism border border-brand-emerald/20 text-brand-emerald text-xs font-bold tracking-wide uppercase mb-6 shadow-sm"
          >
            <Sparkles size={13} className="animate-spin" />
            <span>Next-Gen Financial Intelligence</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-8"
          >
            Save Smarter. <br />
            Build Wealth. <br />
            <span className="gradient-text">Let AI Guide Every Rupee.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Meet the intelligent financial coach that gamifies savings, locks in your discipline, and automatically projects your path to financial freedom.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4.5"
          >
            <button 
              onClick={() => navigate('/signup')} 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black font-bold text-base flex items-center justify-center gap-2 shadow-glow-green transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Build Wealth Now</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('simulator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-cardDark hover:bg-zinc-800 border border-brand-borderDark hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play size={16} className="fill-current text-brand-emerald" />
              <span>Simulate Savings</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Cards Graphic Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Glass Card 1 */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-6 rounded-2xl glassmorphism border border-brand-borderDark/40 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-brand-emerald">
              <DollarSign size={24} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Active Balance</span>
              <h3 className="text-2xl font-bold mt-1">₹45,200.00</h3>
              <p className="text-xs text-brand-emerald font-semibold mt-1">▲ +12% Savings rate this week</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/5 rounded-full blur-xl"></div>
          </motion.div>

          {/* Glass Card 2 (AI Advice simulation) */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-6 rounded-2xl glassmorphism border border-brand-emerald/20 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-brand-purple">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="text-[10px] text-brand-emerald font-mono tracking-wider uppercase">AI Insights</span>
              <p className="text-xs text-zinc-300 mt-2 font-medium leading-relaxed">
                "Skip buying coffee today. By depositing ₹150 directly to your 'Vacation' Goal, you increase your completion probability by 4%!"
              </p>
            </div>
            <span className="inline-flex max-w-fit px-2 py-0.5 rounded bg-purple-900/30 border border-brand-purple/20 text-[10px] text-brand-purple font-semibold mt-2">
              Actionable recommendation
            </span>
          </motion.div>

          {/* Glass Card 3 (Goal Ring simulation) */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-6 rounded-2xl glassmorphism border border-brand-borderDark/40 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-brand-blue">
              <Target size={24} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Savings Goal</span>
                <h4 className="text-lg font-bold mt-1">MacBook Pro</h4>
                <p className="text-xs text-zinc-400 mt-0.5">₹1,35,000 / ₹1,80,000</p>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="rgba(30,30,36,0.5)" strokeWidth="4" fill="transparent" />
                  <circle cx="28" cy="28" r="22" stroke="#10b981" strokeWidth="4" fill="transparent" 
                    strokeDasharray="138" strokeDashoffset="34.5" />
                </svg>
                <span className="absolute text-[10px] font-bold text-brand-emerald">75%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Savings Simulator Section */}
        <section id="simulator" className="mt-32 p-8 md:p-12 rounded-3xl glassmorphism border border-brand-borderDark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="px-3.5 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-extrabold uppercase">Interactive Widget</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-4 tracking-tight leading-tight">
                Simulate Your <br />
                Financial Future
              </h2>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                Adjust the slider to see how small, consistent daily deposits multiply over time with standard compound yields. Smart savings turn small change into large wealth.
              </p>

              {/* Slider 1 */}
              <div className="mt-8">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-400">Daily Savings Amount</span>
                  <span className="text-brand-emerald text-sm">₹{dailySavings}</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="1000" 
                  step="10"
                  value={dailySavings} 
                  onChange={(e) => setDailySavings(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
                />
              </div>

              {/* Slider 2 */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-400">Time Horizon</span>
                  <span className="text-brand-blue text-sm">{years} Years</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  value={years} 
                  onChange={(e) => setYears(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                />
              </div>
            </div>

            {/* Projection Yield Card */}
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-brand-borderDark/60 flex flex-col justify-between text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-emerald to-brand-blue"></div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Estimated Balance in {years} Years</span>
              <h3 className="text-4xl md:text-5xl font-extrabold text-zinc-50 mt-4 tracking-tight drop-shadow-md">{formattedAccumulated}</h3>
              <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
                Calculated assuming a **8% annual compound growth rate** when deposited into standard growth index funds.
              </p>
              <button 
                onClick={() => navigate('/signup')} 
                className="mt-8 w-full py-4.5 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-blue hover:from-brand-emeraldDark hover:to-brand-blue text-black font-extrabold text-sm transition-all shadow-glow-green cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Automate these savings</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Platform Features Grid */}
        <section className="mt-32 text-center">
          <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">The SmartSave Difference</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 tracking-tight">Gamified Financial Discipline</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-brand-cardDark/40 border border-brand-borderDark text-left hover:border-zinc-800 transition-all">
              <Trophy className="text-brand-gold mb-4" size={32} />
              <h4 className="text-base font-bold mb-2">Saving Challenges</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Participate in challenges like "Coffee Challenge" or "No Shopping Week" to unlock XP points and saving badges.</p>
            </div>
            <div className="p-6 rounded-2xl bg-brand-cardDark/40 border border-brand-borderDark text-left hover:border-zinc-800 transition-all">
              <ShieldCheck className="text-brand-emerald mb-4" size={32} />
              <h4 className="text-base font-bold mb-2">Emergency Goal Lock</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Tired of dipping into savings? Enable Goal Lock to enforce a customizable cooling period for withdrawals.</p>
            </div>
            <div className="p-6 rounded-2xl bg-brand-cardDark/40 border border-brand-borderDark text-left hover:border-zinc-800 transition-all">
              <Sparkles className="text-brand-purple mb-4" size={32} />
              <h4 className="text-base font-bold mb-2">AI Savings Projections</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Let our Gemini models forecast your net savings and customize weekly budget caps for shopping and utilities.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12 tracking-tight">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-xl bg-brand-cardDark/30 border border-brand-borderDark">
              <h4 className="text-sm font-bold text-zinc-200">Is SmartSave AI linked to my real bank accounts?</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">No, this is a secure financial planning companion. You log your transactions manually or configure standard allocations, keeping your credentials 100% private and offline.</p>
            </div>
            <div className="p-5 rounded-xl bg-brand-cardDark/30 border border-brand-borderDark">
              <h4 className="text-sm font-bold text-zinc-200">How does the Goal Lock feature function?</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">Goal Lock enforces a customizable 12 to 48-hour cooling delay on any goal withdrawal. This creates a psychological buffer to prevent impulse spending.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-borderDark/40 py-12 text-center text-xs text-zinc-500 bg-zinc-950/20 mt-20">
        <p>© 2026 SmartSave AI Corp. Built for absolute financial discipline and wealth creation.</p>
      </footer>
    </div>
  );
};
