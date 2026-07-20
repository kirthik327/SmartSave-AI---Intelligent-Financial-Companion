import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bgDark text-zinc-50 radial-bg flex items-center justify-center p-6 relative">
      <div className="text-center max-w-md">
        <motion.div 
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-6"
        >
          <ShieldAlert size={32} />
        </motion.div>
        <h1 className="text-6xl font-extrabold tracking-tight mb-2 font-mono">404</h1>
        <h2 className="text-xl font-bold text-zinc-200">Page Lost in Orbit</h2>
        <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">
          The dashboard link you are trying to view does not exist or has been relocated to another secure server coordinate.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 rounded-xl bg-brand-cardDark hover:bg-zinc-800 border border-brand-borderDark hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all"
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
};
