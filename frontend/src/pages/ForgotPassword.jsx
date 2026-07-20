import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-brand-bgDark text-zinc-50 radial-bg flex items-center justify-center p-6 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl glassmorphism border border-brand-borderDark relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-blue flex items-center justify-center shadow-glow-green mx-auto mb-4">
            <ShieldCheck size={24} className="text-black" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Recover Password</h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-semibold">We will send you security reset instructions</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@smartsave.ai"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-sm outline-none text-zinc-200 focus:border-brand-emerald transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-sm font-bold shadow-glow-green cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <span>Send Instructions</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-brand-emerald/20 text-xs font-semibold text-brand-emerald leading-relaxed">
              Security recovery code sent! Check your inbox for dynamic reset link instructions.
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-50 font-semibold transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
