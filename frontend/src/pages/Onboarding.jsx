import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState('INR');
  const [goalLock, setGoalLock] = useState(false);
  const { updateProfileSettings } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(prev => prev + 1);
    else finishOnboarding();
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const finishOnboarding = async () => {
    try {
      await updateProfileSettings({
        currency,
        goalLockEnabled: goalLock
      });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      navigate('/dashboard'); // fallback
    }
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-brand-bgDark text-zinc-50 radial-bg flex items-center justify-center p-6 relative">
      <div className="w-full max-w-xl p-8 rounded-3xl glassmorphism border border-brand-borderDark relative overflow-hidden">
        {/* Step dots */}
        <div className="flex gap-2 justify-center mb-10">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-brand-emerald' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <div className="min-h-64 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-brand-emerald mx-auto mb-6">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">Select Primary Currency</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-md mx-auto">
                  Choose the currency formatting standard for your saving goals, daily streaks, and transactions.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  {[
                    { code: 'INR', label: 'INR (₹) Rupees' },
                    { code: 'USD', label: 'USD ($) Dollars' },
                    { code: 'EUR', label: 'EUR (€) Euros' },
                    { code: 'GBP', label: 'GBP (£) Pounds' }
                  ].map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        currency === curr.code
                          ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald'
                          : 'border-zinc-800 bg-brand-cardDark hover:border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-brand-purple mx-auto mb-6">
                  <Trophy size={28} />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">Gamified Saving Challenges</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-md mx-auto">
                  SmartSave rewards you with XP points, streaks, levels, and badges on completing custom goals and skipping coffee purchases. Get ready to save like playing a game!
                </p>
                <div className="mt-8 flex justify-center gap-6 text-zinc-500 font-semibold text-xs">
                  <div className="flex flex-col items-center">
                    <span className="text-brand-emerald text-lg font-extrabold">XP Rewards</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">Claimable on completions</span>
                  </div>
                  <div className="w-px h-10 bg-zinc-800" />
                  <div className="flex flex-col items-center">
                    <span className="text-brand-gold text-lg font-extrabold">Achievements</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">Unique badges collection</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-brand-blue mx-auto mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">Secure Savings with Goal Lock</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-md mx-auto">
                  Enable Goal Lock to enforce a customizable cooling-off delay (e.g. 24 hours) for withdrawing savings. Perfect for breaking impulse buying habits.
                </p>

                <div className="mt-8 max-w-xs mx-auto flex items-center justify-between p-4.5 rounded-2xl bg-brand-cardDark border border-zinc-800">
                  <div className="text-left">
                    <h5 className="text-xs font-bold">Goal Lock Protection</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Enforce 24h withdrawal delay</p>
                  </div>
                  <button
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-zinc-200/10 dark:border-zinc-800/10">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold flex items-center gap-1.5 shadow-glow-green transition-all cursor-pointer"
            >
              <span>{step === 3 ? 'Finish Tour' : 'Next'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
