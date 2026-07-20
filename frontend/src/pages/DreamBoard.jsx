import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Sparkles, Plus, Heart, Trash2 } from 'lucide-react';

export const DreamBoard = () => {
  const { formatCurrency } = useAuth();
  
  const [dreams, setDreams] = useState([
    {
      id: 1,
      title: 'Dream Villa by the Ocean',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600',
      target: 7500000,
      quote: 'Visualization is the starting point of achievement. Every saved rupee is brick on this ocean villa.'
    },
    {
      id: 2,
      title: 'Premium electric Superbike',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',
      target: 1200000,
      quote: 'Speed towards financial freedom as fast as this superbike. Save ₹300 daily to complete early.'
    }
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [activeMotivation, setActiveMotivation] = useState(null);

  const handleAddDream = (e) => {
    e.preventDefault();
    if (!title || !target) return;

    const fallbackImages = [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
      'https://images.unsplash.com/photo-1496181130204-7552cc15545a?w=600'
    ];
    
    const finalImg = imageUrl || fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    const monthlyNeeded = Math.ceil(parseFloat(target) / 36);

    const newDream = {
      id: Date.now(),
      title,
      image: finalImg,
      target: parseFloat(target),
      quote: `To claim this in 3 years, you need to save roughly ${formatCurrency(monthlyNeeded)} monthly. Pausing dining out once a week helps secure this!`
    };

    setDreams(prev => [...prev, newDream]);
    setShowAdd(false);
    setTitle('');
    setTarget('');
    setImageUrl('');
  };

  const handleDeleteDream = (id) => {
    setDreams(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">Wealth Manifestation</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Dream Board</h2>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-3 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Dream</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dreams.map(dream => (
          <div 
            key={dream.id}
            onClick={() => setActiveMotivation(dream.id === activeMotivation ? null : dream.id)}
            className="rounded-3xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 overflow-hidden cursor-pointer group relative flex flex-col h-[350px] shadow-lg transition-all duration-300"
          >
            {/* Image overlay */}
            <div className="absolute inset-0 bg-zinc-950/40 group-hover:bg-zinc-950/30 transition-all duration-300 z-10" />
            <img 
              src={dream.image} 
              alt={dream.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
            />

            {/* Actions button */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteDream(dream.id); }}
                className="p-2.5 rounded-xl bg-black/60 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 backdrop-blur border border-zinc-700/50 cursor-pointer transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Bottom context details */}
            <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end">
              <span className="text-[10px] text-brand-emerald font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <Heart size={10} className="fill-current" />
                Target: {formatCurrency(dream.target)}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1.5 tracking-tight truncate">{dream.title}</h3>
              
              <AnimatePresence>
                {activeMotivation === dream.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-2xl bg-purple-950/60 border border-brand-purple/20 backdrop-blur text-xs font-medium leading-relaxed text-zinc-300 flex items-start gap-2.5"
                  >
                    <Sparkles size={14} className="text-brand-purple shrink-0 mt-0.5 animate-pulse" />
                    <p>{dream.quote}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dream Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-6">
            <h3 className="text-base font-extrabold mb-4">Anchor Your Dream</h3>
            <form onSubmit={handleAddDream} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Dream Objective</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Beachside vacation home"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Estimated Cost</label>
                  <input 
                    type="number" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="7500000"
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer">
                  Anchor Dream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
