import { db } from '../config/db.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const users = await db.users.read();
    const txs = await db.transactions.read();
    const challenges = await db.challenges.read();
    const logs = await db.logs.read();

    const totalBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);
    const totalSavings = users.reduce((acc, u) => acc + (u.savings || 0), 0);
    
    // Group active users count
    const activeToday = users.filter(u => {
      const todayStr = new Date().toISOString().split('T')[0];
      return u.lastActive && u.lastActive.startsWith(todayStr);
    }).length;

    res.json({
      metrics: {
        totalUsers: users.length,
        activeUsersToday: activeToday,
        totalPlatformBalance: totalBalance,
        totalPlatformSavings: totalSavings,
        totalTransactionsCount: txs.length,
        activeChallenges: challenges.filter(c => !c.completed).length
      },
      health: {
        serverStatus: 'Healthy',
        databaseEngine: 'JSON Hybrid File DB',
        uptime: `${Math.ceil(process.uptime())}s`,
        apiVersion: 'v1.0.0'
      },
      recentLogs: logs.slice(-15).reverse()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSecurityLogs = async (req, res) => {
  try {
    const logs = await db.logs.find({ type: 'SECURITY_ALERT' });
    res.json(logs.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const broadcastNotification = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required for broadcast' });
    }

    const users = await db.users.read();
    for (const user of users) {
      await db.notifications.create({
        userId: user._id,
        title,
        body,
        type: 'broadcast',
        read: false
      });
    }

    res.json({ message: `Successfully broadcasted notification to ${users.length} users.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
