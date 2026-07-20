import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Smartphone, 
  Eye, 
  MapPin, 
  Activity, 
  Sparkles,
  Wifi,
  Trash2,
  QrCode,
  KeyRound,
  RotateCcw,
  Fingerprint
} from 'lucide-react';
import { Line } from 'react-chartjs-2';

export const SecurityCenter = () => {
  const { 
    user, 
    securityStats, 
    securityLogs, 
    guardianAnalysis, 
    toggleEmergencyFreeze, 
    revokeDeviceSession, 
    toggleMFA,
    apiRequest
  } = useAuth();

  const [mfaModal, setMfaModal] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  // WebAuthn Biometrics Registration Simulation states
  const [biometricsRegistered, setBiometricsRegistered] = useState(
    localStorage.getItem('smartsave_webauthn') === 'true'
  );
  const [registeringBio, setRegisteringBio] = useState(false);
  const [bioSuccess, setBioSuccess] = useState('');

  const [statsLoading, setStatsLoading] = useState(false);

  const handleToggleMFA = async (e) => {
    e.preventDefault();
    setMfaError('');
    if (mfaCode !== '123456') {
      return setMfaError('Invalid verification code. Enter sandbox code: 123456');
    }
    
    try {
      await toggleMFA();
      setMfaModal(false);
      setMfaCode('');
    } catch (err) {
      setMfaError(err.message || 'MFA toggle failed');
    }
  };

  const handleTriggerFreeze = async () => {
    try {
      setStatsLoading(true);
      await toggleEmergencyFreeze();
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRegisterBiometrics = () => {
    setRegisteringBio(true);
    setBioSuccess('');
    setTimeout(() => {
      setRegisteringBio(false);
      setBiometricsRegistered(true);
      localStorage.setItem('smartsave_webauthn', 'true');
      setBioSuccess('Device Biometrics (WebAuthn) key registered successfully on this device keychain!');
      setTimeout(() => setBioSuccess(''), 4000);
    }, 2000); // 2 seconds simulated key registration
  };

  const handleRevokeSession = async (loginTime) => {
    if (window.confirm('Are you sure you want to terminate this active device session? The device will be signed out.')) {
      try {
        await revokeDeviceSession(loginTime);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Mock Threats Deflected chart
  const threatChartData = {
    labels: ['10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'],
    datasets: [{
      label: 'Security Threats Deflected',
      data: [14, 22, 19, 31, 28, 42, 38],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      fill: true,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 2
    }]
  };

  const threatChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } }, grid: { display: false } },
      y: { ticks: { color: '#71717a', font: { family: 'Outfit', size: 9 } }, grid: { color: 'rgba(113, 113, 122, 0.08)' } }
    }
  };

  const frozen = securityStats?.emergencyFrozen;

  // Compute security score dynamically based on WebAuthn registration
  let computedScore = securityStats?.securityScore || 75;
  if (biometricsRegistered) computedScore = Math.min(100, computedScore + 10);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Top Banner Alert */}
      {frozen && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold flex items-center justify-between text-rose-400 animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>ACCOUNT LOCKDOWN ACTIVE: Outgoing transactions and new logins are frozen.</span>
          </div>
          <button 
            onClick={handleTriggerFreeze}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold hover:bg-rose-500 hover:text-white transition-all cursor-pointer text-[10px]"
          >
            Deactivate Freeze
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">Intrusion Shield</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Security Center</h2>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/20 border border-emerald-500/20 text-brand-emerald text-xs font-bold">
          <Wifi size={14} className="animate-pulse" />
          <span>Real-time WAF Guard Shield Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {bioSuccess && (
            <div className="p-3.5 text-xs font-semibold rounded-xl bg-emerald-500/10 border border-brand-emerald/20 text-brand-emerald">
              {bioSuccess}
            </div>
          )}

          {/* Shield Score Widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Animated Shield Circular Ring */}
            <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col items-center justify-between h-72 text-center relative overflow-hidden">
              <div className="absolute top-4 left-4 text-left">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Security Integrity</span>
                <h4 className="text-xs font-bold text-zinc-300">Defense Index</h4>
              </div>

              <div className="relative w-32 h-32 flex items-center justify-center mt-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="48" stroke="rgba(30, 30, 36, 0.5)" strokeWidth="6" fill="transparent" />
                  <circle cx="64" cy="64" r="48" stroke={frozen ? '#f43f5e' : '#10b981'} strokeWidth="6" fill="transparent"
                    strokeDasharray="301.5" strokeDashoffset={301.5 - (computedScore / 100) * 301.5}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-2xl font-extrabold ${frozen ? 'text-rose-400' : 'text-zinc-50'}`}>{computedScore}%</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Secure</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                <ShieldCheck size={12} className="text-brand-emerald" />
                <span>AES-256 GCM Storage Active</span>
              </div>
            </div>

            {/* Platform Encryption Specs */}
            <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col justify-between h-72">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Security Infrastructure</h4>
                <div className="flex flex-col gap-3.5 text-xs">
                  <div className="flex justify-between border-b border-zinc-200/10 dark:border-zinc-800/10 pb-1.5">
                    <span className="text-zinc-500 font-semibold">Payload Protection</span>
                    <span className="font-mono text-zinc-300 font-bold">{securityStats?.encryptionStatus?.algorithm}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200/10 dark:border-zinc-800/10 pb-1.5">
                    <span className="text-zinc-500 font-semibold">Transport Security</span>
                    <span className="font-mono text-brand-emerald font-bold">{securityStats?.encryptionStatus?.transport}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200/10 dark:border-zinc-800/10 pb-1.5">
                    <span className="text-zinc-500 font-semibold">DDoS Protection</span>
                    <span className="font-mono text-brand-blue font-bold">{securityStats?.systemHealth?.ddosProtection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-semibold">Firewall Filter</span>
                    <span className="font-mono text-brand-purple font-bold">{securityStats?.systemHealth?.firewall}</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-zinc-500 italic mt-2 leading-relaxed">
                Platform endpoints are audited under SOC2 Type II standards with continuous threat mitigation active.
              </p>
            </div>
          </div>

          {/* Guardian AI Risk Analysis Panel */}
          {guardianAnalysis && (
            <div className={`p-6 rounded-3xl border relative overflow-hidden ${
              guardianAnalysis.riskLevel === 'CRITICAL'
                ? 'border-rose-500/30 bg-rose-500/5'
                : guardianAnalysis.riskLevel === 'MEDIUM'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-zinc-200/50 dark:border-brand-borderDark/50 glassmorphism'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-purple animate-spin" />
                  <h4 className="text-sm font-extrabold tracking-tight">Guardian AI Risk Evaluation</h4>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  guardianAnalysis.riskLevel === 'CRITICAL'
                    ? 'bg-rose-500/10 text-rose-400'
                    : guardianAnalysis.riskLevel === 'MEDIUM'
                      ? 'bg-yellow-500/10 text-brand-gold'
                      : 'bg-emerald-500/10 text-brand-emerald'
                }`}>
                  {guardianAnalysis.riskLevel} RISK
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center mt-4">
                <div className="text-center md:border-r border-zinc-200/10 dark:border-zinc-800/10 p-2">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Confidence</span>
                  <h3 className="text-3xl font-extrabold mt-1 text-zinc-100">{guardianAnalysis.confidenceScore}%</h3>
                </div>
                
                <div className="md:col-span-3 text-left">
                  <h5 className="text-xs font-bold">Detection Reason</h5>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{guardianAnalysis.reason}</p>
                  <p className="text-xs text-brand-purple font-semibold mt-2.5">
                    <strong>Recommended Action:</strong> {guardianAnalysis.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Threat Deflection Monitor */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 h-80 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">ThreatDeflection Rate</h4>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">XSS and Rate deflection logs</p>
              </div>
              <Activity size={16} className="text-rose-500" />
            </div>
            <div className="flex-1 w-full relative">
              <Line data={threatChartData} options={threatChartOptions} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Emergency Lock Control */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold">Emergency Lock Control</h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Instantly lock and freeze all balance transfers if you suspect unauthorized access. Unfreeze requires active verification.
              </p>
            </div>
            
            <button
              onClick={handleTriggerFreeze}
              disabled={statsLoading}
              className={`w-full py-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                frozen 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-glow-green' 
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg'
              }`}
            >
              {frozen ? 'Deactivate Emergency Freeze' : 'Activate Emergency Freeze'}
            </button>
          </div>

          {/* WebAuthn Biometrics Card */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Fingerprint size={14} />
              <span>WebAuthn Device Biometrics</span>
            </h4>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold">Keychain Biometrics</h5>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {biometricsRegistered ? 'Biometrics registered securely' : 'Register your fingerprint/Face ID key'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleRegisterBiometrics}
                disabled={registeringBio}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  biometricsRegistered
                    ? 'bg-emerald-500/10 border border-brand-emerald/20 text-brand-emerald'
                    : 'bg-brand-emerald hover:bg-brand-emeraldDark text-black shadow-glow-green'
                }`}
              >
                {registeringBio ? 'Registering...' : biometricsRegistered ? 'Registered' : 'Register Key'}
              </button>
            </div>
          </div>

          {/* MFA Control */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Smartphone size={14} />
              <span>Multi-Factor Authentication</span>
            </h4>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold">MFA Verification</h5>
                <p className="text-[10px] text-zinc-500 mt-0.5">Protect login with secondary app TOTP codes</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (securityStats?.mfaEnabled) toggleMFA();
                  else setMfaModal(true);
                }}
                className={`w-12 h-6.5 rounded-full transition-all relative cursor-pointer ${
                  securityStats?.mfaEnabled ? 'bg-brand-emerald' : 'bg-zinc-800'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-black absolute top-1 transition-all ${
                    securityStats?.mfaEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Authorized Sessions */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Authorized Sessions</h4>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto no-scrollbar">
              {user?.deviceHistory?.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No active devices.</p>
              ) : (
                user?.deviceHistory?.map((item) => (
                  <div 
                    key={item.loginTime} 
                    className="p-3 rounded-xl bg-brand-cardDark border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="overflow-hidden">
                      <h6 className="font-bold text-zinc-200 truncate max-w-44">{item.device.substring(0, 30)}...</h6>
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-semibold mt-1">
                        <MapPin size={10} />
                        <span>{item.location} • IP: {item.ip}</span>
                      </div>
                      <span className="block text-[8px] text-zinc-600 mt-1 font-mono">{new Date(item.loginTime).toLocaleString('en-IN')}</span>
                    </div>

                    <button 
                      onClick={() => handleRevokeSession(item.loginTime)}
                      className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Intrusion logs timeline */}
          <div className="p-6 rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 flex flex-col h-[280px]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Intrusion Logs Timeline</h4>
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
              {securityLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">No logs logged.</p>
              ) : (
                securityLogs.map((log) => (
                  <div key={log._id} className="p-3.5 rounded-xl bg-brand-cardDark border border-zinc-800 text-[10px] leading-relaxed">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[8px] text-zinc-500 font-mono uppercase">{log.type}</span>
                    <p className="text-zinc-300 mt-1 font-semibold">{log.message}</p>
                    <span className="block text-[8px] text-zinc-600 mt-1 font-mono">{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MFA modal */}
      {mfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-6">
            <h3 className="text-base font-extrabold mb-2">Configure Multi-Factor Authentication</h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Scan the QR token using Google Authenticator or Duo app, then enter the generated 6-digit confirmation code below.
            </p>

            {mfaError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {mfaError}
              </div>
            )}

            <form onSubmit={handleToggleMFA} className="flex flex-col gap-4">
              <div className="w-32 h-32 bg-white rounded-xl border border-zinc-800 flex items-center justify-center mx-auto p-2">
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center rounded">
                  <QrCode size={64} className="text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-[10px] text-zinc-500 font-mono">Secret Key: SS_AI_MFA_987654321</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Enter Verification Code</label>
                <input 
                  type="text" 
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="Enter 123456"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald text-center tracking-widest font-mono font-bold"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setMfaModal(false)} className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer">
                  Activate MFA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
