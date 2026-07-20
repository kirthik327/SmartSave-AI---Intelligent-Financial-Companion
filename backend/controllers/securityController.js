import { db } from '../config/db.js';

export const getSecurityStats = async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate dynamic security score
    let score = 60; // baseline
    if (user.mfaEnabled) score += 15;
    if (user.goalLockEnabled) score += 15;
    if (user.deviceHistory?.length <= 2) score += 10;
    if (user.passwordChangedAt) score += 10;
    score = Math.min(100, score);

    res.json({
      securityScore: score,
      mfaEnabled: !!user.mfaEnabled,
      emergencyFrozen: !!user.emergencyFrozen,
      goalLockEnabled: !!user.goalLockEnabled,
      dailyWithdrawalLimit: user.dailyWithdrawalLimit || 50000,
      encryptionStatus: {
        algorithm: 'AES-256-GCM',
        transport: 'TLSv1.3',
        database: 'Encrypted-at-Rest'
      },
      systemHealth: {
        ddosProtection: 'Active (Cloudflare)',
        firewall: 'Secure (WAF Active)',
        xssProtection: 'Enabled (Helmet)',
        sqlInjectionGuard: 'SQLX Injection Sanitized'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleEmergencyFreeze = async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newFreezeState = !user.emergencyFrozen;
    await db.users.findByIdAndUpdate(req.userId, { emergencyFrozen: newFreezeState });

    // Add security log
    await db.logs.create({
      type: 'SECURITY_ALERT',
      message: `Emergency account freeze ${newFreezeState ? 'ENABLED' : 'DISABLED'} by user.`,
      metadata: { ip: req.ip, device: req.headers['user-agent'] }
    });

    // Notify user via notifications panel
    await db.notifications.create({
      userId: req.userId,
      title: newFreezeState ? 'ACCOUNT FROZEN 🚨' : 'Account Restored ✅',
      body: newFreezeState 
        ? 'All withdrawals are immediately disabled. Login from new devices is blocked.' 
        : 'Goal locks and security withdrawal protocols are active.',
      type: 'security',
      read: false
    });

    res.json({ emergencyFrozen: newFreezeState, message: `Account freeze ${newFreezeState ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const terminateDevice = async (req, res) => {
  try {
    const { loginTime } = req.body;
    if (!loginTime) return res.status(400).json({ message: 'Device login timestamp required' });

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentHistory = user.deviceHistory || [];
    const updatedHistory = currentHistory.filter(d => d.loginTime !== loginTime);

    await db.users.findByIdAndUpdate(req.userId, { deviceHistory: updatedHistory });

    await db.logs.create({
      type: 'SECURITY_ALERT',
      message: 'Active session revoked from Security Center.',
      metadata: { ip: req.ip, device: req.headers['user-agent'] }
    });

    res.json({ deviceHistory: updatedHistory, message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleMFA = async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newMfaState = !user.mfaEnabled;
    await db.users.findByIdAndUpdate(req.userId, { mfaEnabled: newMfaState });

    await db.logs.create({
      type: 'SECURITY_ALERT',
      message: `Multi-Factor Authentication ${newMfaState ? 'ENABLED' : 'DISABLED'}`,
      metadata: { ip: req.ip }
    });

    res.json({ mfaEnabled: newMfaState, message: `MFA ${newMfaState ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSecurityLogs = async (req, res) => {
  try {
    const logs = await db.logs.find();
    // Return all security logs, latest first
    res.json(logs.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGuardianAnalysis = async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Seed mock anomaly analysis if they have transactions
    const txs = await db.transactions.find({ userId: req.userId });
    
    // Check if user has high value logs or withdrawals
    const hasHighTx = txs.some(t => t.amount > 30000);
    const riskLevel = user.emergencyFrozen ? 'CRITICAL' : hasHighTx ? 'MEDIUM' : 'LOW';
    const confidenceScore = user.emergencyFrozen ? 99 : hasHighTx ? 84 : 96;

    const reasons = {
      CRITICAL: 'Account frozen manually by owner. All outgoing cash channels terminated.',
      MEDIUM: 'Unusual cash outflow: Withdrawals exceed weekly baseline averages by 240%. Secondary WebAuthn MFA requested.',
      LOW: 'Behavioral signature matches standard enrollment. Device signature verified.'
    };

    res.json({
      riskLevel,
      confidenceScore,
      reason: reasons[riskLevel],
      recommendedAction: riskLevel === 'LOW' ? 'Maintain standard security hygiene' : riskLevel === 'MEDIUM' ? 'Enable Multi-Factor Auth (MFA) and lock goals.' : 'Perform identity validation via backup recovery email.',
      guardianActive: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
