import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { db } from './config/db.js';
import { protect } from './middleware/authMiddleware.js';
import { signup, login, getProfile, updateProfile, requestOTP } from './controllers/authController.js';
import { createGoal, getGoals, depositToGoal, withdrawFromGoal } from './controllers/goalController.js';
import { createTransaction, getTransactions, deleteTransaction, getStatsSummary } from './controllers/transactionController.js';
import { getAIInsights, getSavingsForecast, chatWithCoach } from './controllers/aiController.js';
import { getChallenges, claimChallengeReward, addCustomChallenge, getBadgesList } from './controllers/gamificationController.js';
import { getAdminDashboard, getSecurityLogs as getAdminLogs, broadcastNotification } from './controllers/adminController.js';

// Security Center Controller Imports
import { 
  getSecurityStats, 
  toggleEmergencyFreeze, 
  terminateDevice, 
  toggleMFA, 
  getSecurityLogs, 
  getGuardianAnalysis 
} from './controllers/securityController.js';

// Payment Gateway Controller Imports
import { createOrder, handleWebhook, handlePayout } from './controllers/paymentController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

const seedDatabase = async () => {
  try {
    const users = await db.users.find();
    if (users.length === 0) {
      console.log('Seeding mock sandbox users with cyber security details...');
      import('bcryptjs').then(async (bcrypt) => {
        const hash = await bcrypt.default.hash('Password123', 10);
        const adminUser = await db.users.create({
          name: 'Kirthik Admin',
          email: 'admin@smartsave.ai',
          password: hash,
          balance: 75000.00,
          savings: 15000.00,
          xp: 850,
          level: 9,
          streak: 12,
          lastActive: new Date().toISOString(),
          currency: 'INR',
          darkMode: true,
          privacyMode: false,
          mfaEnabled: true,
          emergencyFrozen: false,
          dailyWithdrawalLimit: 100000,
          failedAttempts: 0,
          lockoutUntil: null,
          badges: ['Level Explorer', 'Consistency King', 'Gemini Scholar'],
          notifications: { billReminders: true, goalReminders: true, savingAlerts: true, aiAlerts: true },
          goalLockEnabled: true,
          emergencyWithdrawalDelay: 24,
          deviceHistory: [
            { device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', ip: '192.168.1.15', loginTime: new Date().toISOString(), location: 'Mumbai, India' },
            { device: 'Safari/17.0 Mobile/15E148 (iPhone)', ip: '223.189.15.42', loginTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), location: 'Bengaluru, India' }
          ],
          isAdmin: true
        });

        const demoUser = await db.users.create({
          name: 'Aishwarya Roy',
          email: 'demo@smartsave.ai',
          password: hash,
          balance: 24500.00,
          savings: 5400.00,
          xp: 120,
          level: 2,
          streak: 4,
          lastActive: new Date().toISOString(),
          currency: 'INR',
          darkMode: true,
          privacyMode: false,
          mfaEnabled: false,
          emergencyFrozen: false,
          dailyWithdrawalLimit: 50000,
          failedAttempts: 0,
          lockoutUntil: null,
          badges: ['Level Explorer'],
          notifications: { billReminders: true, goalReminders: true, savingAlerts: true, aiAlerts: true },
          goalLockEnabled: false,
          emergencyWithdrawalDelay: 12,
          deviceHistory: [
            { device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0', ip: '192.168.1.28', loginTime: new Date().toISOString(), location: 'Mumbai, India' }
          ]
        });

        await db.logs.create({
          type: 'SECURITY_ALERT',
          message: 'Intrusion Detection Shield: Anti-XSS Sanitizer active.',
          createdAt: new Date(Date.now() - 200 * 60000).toISOString()
        });
        await db.logs.create({
          type: 'SECURITY_ALERT',
          message: 'Rate Limiter active: DDoS Protection filter engaged.',
          createdAt: new Date(Date.now() - 150 * 60000).toISOString()
        });
        await db.logs.create({
          type: 'SECURITY_ALERT',
          message: 'Impossible Travel detected for admin@smartsave.ai: login from Delhi 10 minutes after Mumbai session.',
          createdAt: new Date(Date.now() - 60 * 60000).toISOString()
        });

        const dummyTxs = [
          { title: 'Salary Credit', amount: 35000, type: 'income', category: 'Salary', offsetDays: 14 },
          { title: 'Apartment Rent', amount: 12000, type: 'expense', category: 'Housing', offsetDays: 13 },
          { title: 'Organic Grocery shopping', amount: 2400, type: 'expense', category: 'Food', offsetDays: 10 },
          { title: 'Freelance UI Project', amount: 8000, type: 'income', category: 'Freelance', offsetDays: 8 },
          { title: 'Electric Bill Payment', amount: 1800, type: 'expense', category: 'Utilities', offsetDays: 6 },
          { title: 'Premium Gym Membership', amount: 3500, type: 'expense', category: 'Health', offsetDays: 5 },
          { title: 'Dinner with friends', amount: 1450, type: 'expense', category: 'Dining Out', offsetDays: 2 },
        ];

        for (const user of [adminUser, demoUser]) {
          for (const tx of dummyTxs) {
            await db.transactions.create({
              userId: user._id,
              title: tx.title,
              amount: tx.amount,
              type: tx.type,
              category: tx.category,
              date: new Date(Date.now() - tx.offsetDays * 24 * 60 * 60 * 1000).toISOString()
            });
          }

          await db.goals.create({
            userId: user._id,
            title: 'MacBook Pro 16"',
            targetAmount: 180000,
            currentAmount: 45000,
            deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
            category: 'Gadget',
            completed: false,
            aiPrediction: { completionProbability: 75, smartSuggestion: 'Save ₹1,125 daily to hit target by November.', motivationalQuote: 'Stay focused.' }
          });

          await db.goals.create({
            userId: user._id,
            title: 'Europe Summer Trip',
            targetAmount: 250000,
            currentAmount: 185000,
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400',
            category: 'Vacation',
            completed: false,
            aiPrediction: { completionProbability: 92, smartSuggestion: 'You are on track! An extra deposit of ₹500 weekly will seal it.', motivationalQuote: 'The world awaits.' }
          });
        }
        console.log('Seeding completed successfully!');
      });
    }
  } catch (error) {
    console.error('Error seeding database', error);
  }
};

seedDatabase();

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  const isMongo = !!process.env.MONGODB_URI;
  const dbState = isMongo ? mongoose.connection.readyState : 'local_json_mode';
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    'local_json_mode': 'local_json'
  };
  
  res.json({ 
    status: 'OK', 
    message: 'SmartSave AI Engine is fully functional',
    database: {
      mode: isMongo ? 'MongoDB Atlas' : 'Local JSON Fallback',
      connectionStatus: states[dbState] || dbState,
      readyState: isMongo ? mongoose.connection.readyState : 0
    }
  });
});

// Auth Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', protect, getProfile);
app.put('/api/auth/profile', protect, updateProfile);
app.post('/api/auth/request-otp', requestOTP);

// Goals Routes
app.get('/api/goals', protect, getGoals);
app.post('/api/goals', protect, createGoal);
app.post('/api/goals/deposit', protect, depositToGoal);
app.post('/api/goals/withdraw', protect, withdrawFromGoal);

// Transactions Routes
app.get('/api/transactions', protect, getTransactions);
app.post('/api/transactions', protect, createTransaction);
app.delete('/api/transactions/:id', protect, deleteTransaction);
app.get('/api/transactions/summary', protect, getStatsSummary);

// AI Coach Routes
app.get('/api/ai/insights', protect, getAIInsights);
app.get('/api/ai/forecast', protect, getSavingsForecast);
app.post('/api/ai/chat', protect, chatWithCoach);

// Gamification Routes
app.get('/api/challenges', protect, getChallenges);
app.post('/api/challenges/claim', protect, claimChallengeReward);
app.post('/api/challenges/custom', protect, addCustomChallenge);
app.get('/api/challenges/badges', protect, getBadgesList);

// Notifications Routes
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const list = await db.notifications.find({ userId: req.userId });
    res.json(list.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    const updated = await db.notifications.findByIdAndUpdate(req.params.id, { read: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cybersecurity Subsystem Routes
app.get('/api/security/stats', protect, getSecurityStats);
app.post('/api/security/freeze', protect, toggleEmergencyFreeze);
app.post('/api/security/devices/terminate', protect, terminateDevice);
app.post('/api/security/mfa', protect, toggleMFA);
app.get('/api/security/logs', protect, getSecurityLogs);
app.get('/api/security/guardian', protect, getGuardianAnalysis);

// Payment Gateway Commercial Simulation Routes
app.post('/api/payments/create-order', protect, createOrder);
app.post('/api/payments/webhook', protect, handleWebhook);
app.post('/api/payments/payout', protect, handlePayout);

// Admin Routes
app.get('/api/admin/dashboard', protect, getAdminDashboard);
app.get('/api/admin/logs', protect, getAdminLogs);
app.post('/api/admin/broadcast', protect, broadcastNotification);

app.listen(PORT, () => {
  console.log(`SmartSave AI Backend API running on port ${PORT}`);
});
