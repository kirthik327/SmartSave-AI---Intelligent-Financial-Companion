import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight, Sparkles, Smartphone, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Secondary MFA Code Step
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, apiRequest } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return setLocalError('Enter email to receive OTP');
    setLoading(true);
    setLocalError('');
    try {
      await apiRequest('/api/auth/request-otp', 'POST', { email });
      setOtpSent(true);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (mfaRequired) {
        // Complete second factor authentication step
        await login(cleanEmail, cleanPassword, null, mfaCode);
        navigate('/dashboard');
      } else if (useOtp) {
        const res = await login(cleanEmail, null, otpCode);
        if (res?.mfaRequired) {
          setMfaRequired(true);
        } else {
          navigate('/dashboard');
        }
      } else {
        const res = await login(cleanEmail, cleanPassword);
        if (res?.mfaRequired) {
          setMfaRequired(true);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError('');
    try {
      await login('demo@smartsave.ai', 'Password123');
      navigate('/dashboard');
    } catch (err) {
      setLocalError('Google OAuth demo failed');
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
          <h2 className="text-2xl font-extrabold tracking-tight">
            {mfaRequired ? 'Security Challenge' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-semibold">
            {mfaRequired ? 'Enter Google Authenticator OTP' : 'Enter credentials or use sandbox demo'}
          </p>
        </div>

        {localError && (
          <div className="p-3.5 mb-6 text-xs font-semibold rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {localError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          
          {mfaRequired ? (
            /* Multi-factor validation view */
            <div>
              <div className="p-3 mb-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-[10px] text-zinc-300 font-semibold leading-relaxed flex items-start gap-2">
                <ShieldAlert size={14} className="text-brand-purple shrink-0" />
                <span>Multi-Factor Authentication Shield active. Provide secondary authenticator code.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">MFA Token Code</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" 
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="Enter 123456"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-sm outline-none text-zinc-200 focus:border-brand-emerald tracking-widest font-mono text-center font-bold"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-sm font-bold shadow-glow-green cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Verifying Code...' : 'Complete Login'}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* Standard credentials view */
            <>
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

              {!useOtp ? (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase">Password</label>
                    <Link to="/forgot-password" className="text-xs text-brand-emerald hover:underline font-semibold">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password123"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-sm outline-none text-zinc-200 focus:border-brand-emerald transition-all"
                      required={!useOtp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">OTP Code</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                      type="text" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder={otpSent ? "Enter 123456" : "Request OTP code"}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-sm outline-none text-zinc-200 focus:border-brand-emerald transition-all"
                      disabled={!otpSent}
                      required={useOtp}
                    />
                  </div>
                  {!otpSent && (
                    <button 
                      type="button"
                      onClick={handleRequestOtp}
                      className="mt-2 text-xs text-brand-emerald hover:underline font-semibold cursor-pointer"
                    >
                      Send OTP Code
                    </button>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-sm font-bold shadow-glow-green cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </form>

        {!mfaRequired && (
          <>
            <div className="my-6 flex items-center justify-between text-xs text-zinc-600 font-semibold">
              <hr className="w-1/3 border-zinc-800" />
              <span>OR CONTINUE WITH</span>
              <hr className="w-1/3 border-zinc-800" />
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-xl bg-brand-cardDark hover:bg-zinc-800 border border-brand-borderDark text-zinc-300 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.664 0-8.378-3.72-8.378-8.39s3.714-8.39 8.378-8.39c2.25 0 4.185.836 5.679 2.228l3.195-3.193C18.91 1.093 15.84 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c5.78 0 10.97-4.14 10.97-12.24 0-.742-.083-1.425-.2-1.955H12.24z"/>
              </svg>
              <span>Sign In with Google (Sandbox)</span>
            </button>

            <div className="mt-8 text-center flex flex-col gap-2">
              <button 
                onClick={() => setUseOtp(!useOtp)}
                className="text-xs text-brand-blue hover:underline font-semibold cursor-pointer"
              >
                {useOtp ? 'Use Email Password' : 'Sign in with Mobile / OTP'}
              </button>
              <p className="text-xs text-zinc-500 mt-2 font-semibold">
                New to SmartSave? <Link to="/signup" className="text-brand-emerald hover:underline">Create account</Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
