import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Good', 'Excellent'];
  const strengthColors = ['bg-rose-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      return setLocalError('Passwords do not match. Please verify your entries.');
    }

    if (strengthScore < 2) {
      return setLocalError('Password is too weak. Please include at least 8 characters and numbers.');
    }

    setLoading(true);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    try {
      await signup(cleanName, cleanEmail, cleanPassword);
      // Take to onboarding flow first!
      navigate('/onboarding');
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bgDark text-zinc-50 radial-bg flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl glassmorphism border border-brand-borderDark relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-blue flex items-center justify-center shadow-glow-green mx-auto mb-4">
            <ShieldCheck size={24} className="text-black" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-semibold">Join the wealth-building coach</p>
        </div>

        {localError && (
          <div className="p-3.5 mb-6 text-xs font-semibold rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {localError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aishwarya Roy"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-sm outline-none text-zinc-200 focus:border-brand-emerald transition-all"
                required
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-sm outline-none text-zinc-200 focus:border-brand-emerald transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength meter */}
            {password && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-semibold mb-1">
                  <span className="text-zinc-500">Strength:</span>
                  <span className={strengthScore > 1 ? 'text-brand-emerald' : 'text-rose-400'}>
                    {strengthLabels[strengthScore - 1] || 'Too Weak'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((bar) => (
                    <div 
                      key={bar}
                      className={`h-1.5 rounded-full transition-all ${
                        bar <= strengthScore 
                          ? strengthColors[strengthScore - 1] 
                          : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-sm outline-none text-zinc-200 focus:border-brand-emerald transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-sm font-bold shadow-glow-green cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-8 font-semibold">
          Already have an account? <Link to="/login" className="text-brand-emerald hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};
