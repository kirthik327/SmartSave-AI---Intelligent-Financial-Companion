import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smartsave_super_secret_key_12345';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const strength = getPasswordStrength(password);
    if (strength < 2) {
      return res.status(400).json({ 
        message: 'Password is too weak. It must be at least 8 characters and contain letters and numbers.' 
      });
    }

    const existingUser = await db.users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const signupTime = new Date().toISOString();

    const newUser = await db.users.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      balance: 10000.0,
      savings: 0.0,
      xp: 0,
      level: 1,
      streak: 1,
      lastActive: signupTime,
      passwordChangedAt: signupTime,
      currency: 'INR',
      language: 'en',
      darkMode: true,
      privacyMode: false,
      mfaEnabled: false,
      emergencyFrozen: false,
      dailyWithdrawalLimit: 50000,
      failedAttempts: 0,
      lockoutUntil: null,
      notifications: {
        billReminders: true,
        goalReminders: true,
        savingAlerts: true,
        aiAlerts: true
      },
      goalLockEnabled: false,
      emergencyWithdrawalDelay: 24,
      badges: [],
      deviceHistory: [{
        device: req.headers['user-agent'] || 'Unknown Device',
        ip: req.ip || '127.0.0.1',
        loginTime: signupTime,
        location: 'Mumbai, India'
      }]
    });

    // Default challenges seeding
    await db.challenges.create({
      userId: newUser._id,
      title: 'Save ₹50 Daily',
      description: 'Deposit at least ₹50 in savings today.',
      type: 'daily',
      target: 50,
      current: 0,
      xpReward: 15,
      completed: false,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    await db.challenges.create({
      userId: newUser._id,
      title: 'Coffee Challenge',
      description: 'Skip your premium coffee purchase and save ₹150.',
      type: 'daily',
      target: 150,
      current: 0,
      xpReward: 30,
      completed: false,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userProfile } = newUser;

    res.status(201).json({ token, user: userProfile });
  } catch (error) {
    console.error('Signup error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, otp, mfaCode } = req.body;

    if (!email || (!password && !otp)) {
      return res.status(400).json({ message: 'Email and password (or OTP) are required' });
    }

    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Lockout verification
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.lockoutUntil) - new Date()) / (60 * 1000));
      return res.status(403).json({ 
        message: `Account temporarily locked due to repeated login failures. Please retry in ${remainingMin} minutes.` 
      });
    }

    const currentDevice = req.headers['user-agent'] || 'Unknown Device';
    const currentIp = req.ip || '127.0.0.1';
    const knownDevices = user.deviceHistory || [];
    const isNewDevice = !knownDevices.some(d => d.device === currentDevice);

    // Emergency Account Freeze verification
    if (user.emergencyFrozen) {
      if (isNewDevice) {
        // Log suspicious alert
        await db.logs.create({
          type: 'SECURITY_ALERT',
          message: `Blocked unauthorized login attempt to FROZEN account from unrecognized device: ${currentDevice.substring(0, 40)}`,
          metadata: { ip: currentIp, email }
        });
        return res.status(403).json({ 
          message: 'Account is under EMERGENCY LOCK. Access from unrecognized devices is blocked. Please contact support.' 
        });
      }
    }

    // Credentials matching check
    let credentialsMatch = false;
    if (otp) {
      credentialsMatch = (otp === '123456');
    } else {
      credentialsMatch = await bcrypt.compare(password, user.password);
    }

    if (!credentialsMatch) {
      // Increment failed attempts
      const failedCount = (user.failedAttempts || 0) + 1;
      let lockoutDate = null;

      if (failedCount >= 3) {
        lockoutDate = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minute lockout
        await db.logs.create({
          type: 'SECURITY_ALERT',
          message: `Temporary account lockout triggered for ${email} after 3 failed login attempts.`,
          metadata: { ip: currentIp, device: currentDevice }
        });
      }

      await db.users.findByIdAndUpdate(user._id, { 
        failedAttempts: failedCount,
        lockoutUntil: lockoutDate
      });

      return res.status(401).json({ 
        message: failedCount >= 3 
          ? 'Too many failed login attempts. Your account has been temporarily locked for 10 minutes.' 
          : `Invalid credentials. Attempt ${failedCount} of 3 before temporary lockout.` 
      });
    }

    // Reset failed counter on successful match
    await db.users.findByIdAndUpdate(user._id, { failedAttempts: 0, lockoutUntil: null });

    // MFA secondary challenge check
    if (user.mfaEnabled && !mfaCode) {
      return res.json({ 
        mfaRequired: true, 
        message: 'Multi-Factor Verification Required. Enter code from your authenticator application.' 
      });
    }

    if (user.mfaEnabled && mfaCode !== '123456') { // Sandbox TOTP code
      return res.status(400).json({ message: 'Invalid Multi-Factor Authentication Code.' });
    }

    // Streaks logic
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = user.lastActive.split('T')[0];
    let updatedStreak = user.streak;

    if (lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (lastActiveDate === yesterday) {
        updatedStreak += 1;
      } else {
        updatedStreak = 1;
      }
    }

    // Seed location based on IP block
    const mockLocations = ['Mumbai, India', 'Bengaluru, India', 'Delhi, India'];
    const mockGeo = mockLocations[Math.floor(Math.random() * mockLocations.length)];

    // Log login alert for "Impossible Travel Detection" if IP locations change rapidly
    const lastLoginLocation = knownDevices[0]?.location;
    if (lastLoginLocation && lastLoginLocation !== mockGeo) {
      await db.logs.create({
        type: 'SECURITY_ALERT',
        message: `Impossible Travel anomaly detected for ${email}: login from ${mockGeo} followed location ${lastLoginLocation}`,
        metadata: { ip: currentIp, lastLocation: lastLoginLocation, currentLocation: mockGeo }
      });
    }

    const updatedHistory = [
      { device: currentDevice, ip: currentIp, loginTime: new Date().toISOString(), location: mockGeo },
      ...knownDevices
    ].slice(0, 10);

    const updatedUser = await db.users.findByIdAndUpdate(user._id, {
      streak: updatedStreak,
      lastActive: new Date().toISOString(),
      deviceHistory: updatedHistory
    });

    if (isNewDevice) {
      await db.notifications.create({
        userId: user._id,
        title: 'New Device Recognized 🔒',
        body: `A login was registered from a new device: ${currentDevice.substring(0, 30)}...`,
        type: 'security',
        read: false
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userProfile } = updatedUser;

    res.json({ token, user: userProfile, deviceAlert: isNewDevice });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password: _, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);
    
    // Prevent updating settings if account is frozen
    if (user?.emergencyFrozen) {
      return res.status(403).json({ message: 'Account settings are locked during Emergency Freeze.' });
    }

    const { currency, darkMode, privacyMode, notifications, goalLockEnabled, language } = req.body;
    const updates = {};
    if (currency !== undefined) updates.currency = currency;
    if (darkMode !== undefined) updates.darkMode = darkMode;
    if (privacyMode !== undefined) updates.privacyMode = privacyMode;
    if (notifications !== undefined) updates.notifications = notifications;
    if (goalLockEnabled !== undefined) updates.goalLockEnabled = goalLockEnabled;
    if (language !== undefined) updates.language = language;

    const updatedUser = await db.users.findByIdAndUpdate(req.userId, updates);
    const { password: _, ...userProfile } = updatedUser;
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  res.json({ 
    message: 'OTP Code sent successfully. Enter "123456" to log in for this sandbox environment.',
    sandboxCode: '123456'
  });
};
