import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Target, 
  Calendar, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Bot, 
  Smartphone,
  SmartphoneIcon,
  QrCode,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Goals = () => {
  const { 
    goals, 
    createNewGoal, 
    createPaymentOrder,
    triggerMockWebhook,
    requestUpiPayout,
    withdrawFromGoalItem, 
    formatCurrency 
  } = useAuth();

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalCategory, setGoalCategory] = useState('General');
  const [goalError, setGoalError] = useState('');

  // Commercial Payment Gateway Mock states
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  
  // Razorpay Checkout Panel states
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [rzpOrder, setRzpOrder] = useState(null);
  const [rzpMethod, setRzpMethod] = useState(''); // 'gpay' or 'qr'
  const [rzpStep, setRzpStep] = useState('select'); // 'select', 'processing', 'pin_input', 'complete'
  const [rzpStatusText, setRzpStatusText] = useState('');

  // UPI VPA Payout states
  const [withdrawGoalId, setWithdrawGoalId] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Guardian AI Biometrics Overlay States
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [biometricOtp, setBiometricOtp] = useState('');
  const [biometricError, setBiometricError] = useState('');
  const [threatScore, setThreatScore] = useState(0);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setGoalError('');
    if (!goalTitle || !goalTarget || !goalDeadline) {
      return setGoalError('Please fill out all fields');
    }

    try {
      await createNewGoal({
        title: goalTitle,
        targetAmount: parseFloat(goalTarget),
        deadline: goalDeadline,
        category: goalCategory
      });
      setShowAddGoal(false);
      setGoalTitle('');
      setGoalTarget('');
      setGoalDeadline('');
    } catch (err) {
      setGoalError(err.message || 'Failed to create goal');
    }
  };

  // 1. Initiates payment order from backend
  const handleInitiateDeposit = async (e) => {
    e.preventDefault();
    setDepositError('');
    if (!depositAmount || isNaN(parseFloat(depositAmount))) {
      return setDepositError('Enter a valid amount');
    }

    try {
      const order = await createPaymentOrder(parseFloat(depositAmount), depositGoalId);
      setRzpOrder(order);
      setRzpStep('select');
      setRzpMethod('');
      setShowRazorpay(true);
      // Close amount selection modal
      setDepositGoalId(null);
    } catch (err) {
      setDepositError(err.message || 'Deposit initiation failed');
    }
  };

  // 2. Simulates Razorpay UPI GPay checkouts
  const handleSelectGPay = () => {
    setRzpMethod('gpay');
    setRzpStep('processing');
    setRzpStatusText('Redirecting to Google Pay app...');
    
    setTimeout(() => {
      setRzpStep('pin_input');
    }, 1500);
  };

  const handleConfirmUPIPinPayment = async () => {
    setRzpStep('processing');
    setRzpStatusText('Verifying merchant UPI signatures...');
    
    setTimeout(async () => {
      try {
        const paymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
        
        // Push mock Webhook Callback to Express Backend
        const res = await triggerMockWebhook({
          orderId: rzpOrder.orderId,
          goalId: rzpOrder.goalId,
          amount: rzpOrder.amount,
          paymentId,
          signature: 'mock_razorpay_signature_success'
        });

        setRzpStep('complete');
        setRzpStatusText(`Payment Ref: ${paymentId}`);
        setDepositAmount('');
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        setRzpStep('select');
        setDepositError(err.message || 'Webhook verification rejected payment');
      }
    }, 2000);
  };

  // 3. RazorpayX Payout Withdrawal
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || !withdrawUpi) {
      return setWithdrawError('Please fill out all fields');
    }

    // VPA Format check
    const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!vpaRegex.test(withdrawUpi)) {
      return setWithdrawError('Invalid UPI ID. Use standard format (e.g. name@bank)');
    }

    try {
      // Check if Guardian AI triggers
      if (parseFloat(withdrawAmount) > 20000) {
        // High risk triggered
        setThreatScore(Math.ceil(70 + (parseFloat(withdrawAmount) / 10000)));
        setShowBiometrics(true);
        setBiometricSuccess(false);
        setBiometricScanning(false);
        setBiometricError('');
        setBiometricOtp('');
        // Close main withdrawal modal
        setWithdrawGoalId(null);
      } else {
        await requestUpiPayout(withdrawGoalId, parseFloat(withdrawAmount), withdrawUpi);
        setWithdrawGoalId(null);
        setWithdrawAmount('');
        setWithdrawUpi('');
      }
    } catch (err) {
      setWithdrawError(err.message || 'Withdrawal failed');
    }
  };

  const startBiometricScan = () => {
    setBiometricScanning(true);
    setBiometricError('');
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
    }, 2000);
  };

  const handleConfirmBiometricWithdrawal = async (e) => {
    e.preventDefault();
    setBiometricError('');
    if (biometricOtp !== '123456') {
      return setBiometricError('Invalid OTP code. Enter: 123456');
    }

    try {
      await requestUpiPayout(
        depositGoalId || goals[0]?._id, // active goal id context
        parseFloat(withdrawAmount),
        withdrawUpi
      );
      setShowBiometrics(false);
      setWithdrawAmount('');
      setWithdrawUpi('');
      
      confetti({
        particleCount: 100,
        spread: 60,
        colors: ['#3b82f6', '#10b981']
      });
    } catch (err) {
      setBiometricError(err.message || 'Verification override failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto radial-bg p-6 lg:p-8 no-scrollbar bg-zinc-50 dark:bg-brand-bgDark text-zinc-950 dark:text-zinc-50">
      
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] text-brand-emerald font-mono tracking-widest uppercase">Target Milestones</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">Savings Goals</h2>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-5 py-3 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Grid of saving targets */}
      {goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-brand-borderDark max-w-xl mx-auto my-20">
          <Target className="text-zinc-400 mb-4 animate-bounce" size={48} />
          <h4 className="text-base font-bold text-zinc-200">No Saving Goals Configured</h4>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm">
            Configure target objectives like buying a laptop, car, or emergency buffer to unlock smart AI daily contributions.
          </p>
          <button 
            onClick={() => setShowAddGoal(true)}
            className="mt-6 px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.ceil((goal.currentAmount / goal.targetAmount) * 100));

            return (
              <div 
                key={goal._id} 
                className={`rounded-2xl glassmorphism border flex flex-col justify-between overflow-hidden relative ${
                  goal.completed 
                    ? 'border-brand-emerald bg-brand-emerald/5' 
                    : 'border-zinc-200/50 dark:border-brand-borderDark/50'
                }`}
              >
                <div className="h-32 w-full relative overflow-hidden bg-zinc-900/40">
                  <img src={goal.image} alt={goal.title} className="w-full h-full object-cover opacity-60 hover:scale-105 transition-all duration-500" />
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 border border-zinc-700 text-[9px] font-bold text-zinc-300">
                    {goal.category}
                  </span>
                  
                  <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    <div className="relative w-11 h-11 flex items-center justify-center bg-black/40 backdrop-blur rounded-full">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="22" cy="22" r="16" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="transparent" />
                        <circle cx="22" cy="22" r="16" stroke="#10b981" strokeWidth="2.5" fill="transparent" 
                          strokeDasharray="100.5" strokeDashoffset={100.5 - (pct / 100) * 100.5} />
                      </svg>
                      <span className="absolute text-[9px] font-extrabold text-brand-emerald">{pct}%</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none truncate max-w-40">{goal.title}</h4>
                      <p className="text-[10px] text-zinc-300 leading-none mt-1">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-[9px] font-bold">
                        <Sparkles size={10} className="animate-spin" />
                        <span>AI Chance: {goal.aiPrediction?.completionProbability || 80}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                        <Calendar size={10} />
                        <span>Due: {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed bg-zinc-100/50 dark:bg-brand-cardDark/50 p-2.5 rounded-xl border border-zinc-200/20 dark:border-brand-borderDark/20">
                      {goal.aiPrediction?.smartSuggestion}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setDepositGoalId(goal._id)}
                      className="py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-[11px] font-bold shadow-glow-green cursor-pointer text-center"
                    >
                      Deposit Cash
                    </button>
                    <button 
                      onClick={() => {
                        setWithdrawGoalId(goal._id);
                        setDepositGoalId(goal._id); 
                      }}
                      className="py-2.5 rounded-xl bg-brand-cardDark hover:bg-zinc-800 border border-brand-borderDark text-zinc-300 text-[11px] font-semibold cursor-pointer text-center"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enter Amount Deposit Modal */}
      {depositGoalId && !withdrawGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-6">
            <h3 className="text-base font-extrabold mb-3">Deposit Savings</h3>
            
            {depositError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {depositError}
              </div>
            )}

            <form onSubmit={handleInitiateDeposit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Deposit Amount</label>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="500"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setDepositGoalId(null)} className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer">
                  Proceed to Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Commercial Checkout Simulation Panel */}
      {showRazorpay && rzpOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-left">
            {/* Razorpay blue header */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200">Merchant Platform</span>
                <h4 className="text-sm font-extrabold">SmartSave AI Gateway</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-200 uppercase font-mono">Amount</span>
                <p className="text-sm font-extrabold">₹{rzpOrder.amount}</p>
              </div>
            </div>

            {/* RZP Steps Panels */}
            <div className="p-6 min-h-[220px] flex flex-col justify-between">
              
              {rzpStep === 'select' && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Select UPI Payment Method</span>
                  
                  {/* Google Pay */}
                  <button 
                    onClick={handleSelectGPay}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/50 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <SmartphoneIcon className="text-brand-emerald" size={18} />
                      <span>Google Pay (Simulated Intent)</span>
                    </div>
                    <ArrowRight size={14} className="text-zinc-500" />
                  </button>

                  {/* Mock QR Code */}
                  <button 
                    onClick={() => { setRzpMethod('qr'); setRzpStep('pin_input'); }}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/50 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <QrCode className="text-brand-blue" size={18} />
                      <span>UPI QR Code Scan</span>
                    </div>
                    <ArrowRight size={14} className="text-zinc-500" />
                  </button>
                </div>
              )}

              {rzpStep === 'processing' && (
                <div className="text-center py-10 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-zinc-400">{rzpStatusText}</p>
                </div>
              )}

              {rzpStep === 'pin_input' && rzpMethod === 'gpay' && (
                <div className="text-center py-4 flex flex-col gap-4">
                  <div className="p-4.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs leading-relaxed max-w-sm mx-auto">
                    <Smartphone className="mx-auto text-brand-emerald mb-2 animate-bounce" size={24} />
                    <span>Mock GPay App initialized. Type your UPI PIN on device keychain.</span>
                  </div>
                  <button 
                    onClick={handleConfirmUPIPinPayment}
                    className="w-full py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer"
                  >
                    Input UPI PIN & Authorize Deposit
                  </button>
                </div>
              )}

              {rzpStep === 'pin_input' && rzpMethod === 'qr' && (
                <div className="text-center py-2 flex flex-col items-center gap-4">
                  <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center p-2">
                    <QrCode size={96} className="text-black" />
                  </div>
                  <p className="text-xs text-zinc-400">Scan QR code using GPay to deposit ₹{rzpOrder.amount}</p>
                  <button 
                    onClick={handleConfirmUPIPinPayment}
                    className="w-full py-3 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer"
                  >
                    Confirm Callback Received
                  </button>
                </div>
              )}

              {rzpStep === 'complete' && (
                <div className="text-center py-6 flex flex-col items-center gap-4">
                  <CheckCircle2 className="text-brand-emerald animate-bounce" size={48} />
                  <div>
                    <h5 className="text-sm font-extrabold text-zinc-200">Gateway Deposit Completed</h5>
                    <p className="text-[10px] text-zinc-500 mt-1">{rzpStatusText}</p>
                  </div>
                  <button 
                    onClick={() => { setShowRazorpay(false); setRzpOrder(null); }}
                    className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold cursor-pointer"
                  >
                    Close Checkout
                  </button>
                </div>
              )}

              {/* RZP footer */}
              {rzpStep !== 'complete' && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-800 text-[9px] text-zinc-500 font-semibold uppercase">
                  <span>Order ID: {rzpOrder.orderId}</span>
                  <button 
                    onClick={() => { setShowRazorpay(false); setRzpOrder(null); }}
                    className="text-zinc-400 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPI VPA Payout Withdraw Modal */}
      {withdrawGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-6">
            <div className="flex items-center gap-2 text-rose-400 mb-3">
              <Lock size={18} />
              <h3 className="text-base font-extrabold">Instant UPI Payout</h3>
            </div>
            
            {withdrawError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Withdrawal Amount</label>
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Recipient UPI ID (VPA)</label>
                <input 
                  type="text" 
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  placeholder="aishwarya@okaxis"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald font-mono text-center tracking-wide"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => { setWithdrawGoalId(null); setDepositGoalId(null); }} 
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">
                  Request UPI Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guardian AI Biometrics & OTP confirmation Overlay */}
      {showBiometrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl glassmorphism border border-rose-500/20 shadow-2xl p-8 text-center relative overflow-hidden">
            
            <div className="flex items-center justify-center gap-2 text-rose-400 mb-6 font-mono text-xs font-bold">
              <Bot size={16} className="animate-pulse" />
              <span>GUARDIAN AI OVERRIDE REQUIRED (Threat Risk: {threatScore}%)</span>
            </div>

            <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center rounded-full border border-zinc-800 p-2">
              <div className="w-full h-full rounded-full bg-brand-cardDark flex items-center justify-center relative overflow-hidden">
                <ShieldCheck className={`w-16 h-16 transition-all ${
                  biometricSuccess ? 'text-brand-emerald scale-110' : 'text-zinc-600'
                }`} />
                
                {biometricScanning && (
                  <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="absolute left-0 w-full h-1 bg-brand-emerald/60 shadow-glow-green"
                  />
                )}
              </div>
            </div>

            {biometricError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {biometricError}
              </div>
            )}

            {!biometricSuccess ? (
              <div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Please perform visual biometrics verification scan to confirm you are the verified account holder.
                </p>
                <button
                  type="button"
                  onClick={startBiometricScan}
                  disabled={biometricScanning}
                  className="px-6 py-3 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer disabled:opacity-50"
                >
                  {biometricScanning ? 'Scanning FaceID...' : 'Start Biometric Scan'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBiometricWithdrawal} className="flex flex-col gap-4">
                <p className="text-xs text-brand-emerald font-semibold leading-relaxed mb-2">
                  ✓ Biometric scanner signature matched. Provide secondary mobile OTP.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mobile OTP Code</label>
                  <div className="relative">
                    <SmartphoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                      type="text" 
                      value={biometricOtp}
                      onChange={(e) => setBiometricOtp(e.target.value)}
                      placeholder="Enter 123456"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald text-center tracking-widest font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowBiometrics(false); setWithdrawAmount(''); }}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel Override
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer">
                    Confirm Payout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glassmorphism border border-zinc-200/50 dark:border-brand-borderDark/50 shadow-2xl p-6">
            <h3 className="text-base font-extrabold mb-4">Establish Savings Goal</h3>

            {goalError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {goalError}
              </div>
            )}

            <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Goal Objective</label>
                <input 
                  type="text" 
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="MacBook Pro"
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Target Cost</label>
                  <input 
                    type="number" 
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="180000"
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-200 focus:border-brand-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Target Date</label>
                  <input 
                    type="date" 
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Category</label>
                <select 
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-brand-cardDark border border-zinc-800 text-xs outline-none text-zinc-400 focus:border-brand-emerald"
                >
                  <option value="Gadget">Gadget / Tech</option>
                  <option value="Bike">Bike / Vehicle</option>
                  <option value="Vacation">Vacation / Travel</option>
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="General">General Savings</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowAddGoal(false)} className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-black text-xs font-bold shadow-glow-green cursor-pointer">
                  Establish Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
