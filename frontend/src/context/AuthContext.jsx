import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartsave_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [badges, setBadges] = useState([]);
  
  const [securityStats, setSecurityStats] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [guardianAnalysis, setGuardianAnalysis] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('smartsave_token', token);
      fetchUserData();
    } else {
      localStorage.removeItem('smartsave_token');
      setUser(null);
      setStats(null);
      setGoals([]);
      setTransactions([]);
      setChallenges([]);
      setNotifications([]);
      setBadges([]);
      setSecurityStats(null);
      setSecurityLogs([]);
      setGuardianAnalysis(null);
      setLoading(false);
    }
  }, [token]);

  const apiRequest = async (path, method = 'GET', body = null) => {
    setError(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const config = {
        method,
        headers,
      };
      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(path, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.message || 'Something went wrong', response.status);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchSecurityData = async () => {
    if (!token) return;
    try {
      const [secStats, secLogs, secGuardian] = await Promise.all([
        apiRequest('/api/security/stats'),
        apiRequest('/api/security/logs'),
        apiRequest('/api/security/guardian')
      ]);
      setSecurityStats(secStats);
      setSecurityLogs(secLogs);
      setGuardianAnalysis(secGuardian);
    } catch (err) {
      console.error('Error loading security credentials', err);
    }
  };

  const fetchUserData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const profile = await apiRequest('/api/auth/profile');
      setUser(profile);
      
      const [summary, goalsList, txsList, challengesList, notificationsList, badgesList] = await Promise.all([
        apiRequest('/api/transactions/summary'),
        apiRequest('/api/goals'),
        apiRequest('/api/transactions'),
        apiRequest('/api/challenges'),
        apiRequest('/api/notifications'),
        apiRequest('/api/challenges/badges')
      ]);

      setStats(summary);
      setGoals(goalsList);
      setTransactions(txsList);
      setChallenges(challengesList);
      setNotifications(notificationsList);
      setBadges(badgesList);
      
      await fetchSecurityData();
    } catch (err) {
      console.error('Error fetching user data', err);
      // Only logout if unauthorized/forbidden, do not logout on server/network errors
      if (err.status === 401 || err.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/signup', 'POST', { name, email, password });
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const login = async (email, password, otp = null, mfaCode = null) => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', 'POST', { email, password, otp, mfaCode });
      if (data.mfaRequired) {
        setLoading(false);
        return data;
      }
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
  };

  const updateProfileSettings = async (updates) => {
    try {
      const updatedUser = await apiRequest('/api/auth/profile', 'PUT', updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  // Cybersecurity Triggers
  const toggleEmergencyFreeze = async () => {
    try {
      const res = await apiRequest('/api/security/freeze', 'POST');
      if (user) {
        setUser(prev => ({ ...prev, emergencyFrozen: res.emergencyFrozen }));
      }
      setSecurityStats(prev => prev ? { ...prev, emergencyFrozen: res.emergencyFrozen } : null);
      
      const [secLogs, secGuardian, updatedUser] = await Promise.all([
        apiRequest('/api/security/logs'),
        apiRequest('/api/security/guardian'),
        apiRequest('/api/auth/profile')
      ]);
      setSecurityLogs(secLogs);
      setGuardianAnalysis(secGuardian);
      setUser(updatedUser);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const revokeDeviceSession = async (loginTime) => {
    try {
      const res = await apiRequest('/api/security/devices/terminate', 'POST', { loginTime });
      if (user) {
        setUser(prev => ({ ...prev, deviceHistory: res.deviceHistory }));
      }
      
      const secLogs = await apiRequest('/api/security/logs');
      setSecurityLogs(secLogs);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const toggleMFA = async () => {
    try {
      const res = await apiRequest('/api/security/mfa', 'POST');
      setSecurityStats(prev => prev ? { ...prev, mfaEnabled: res.mfaEnabled } : null);
      if (user) {
        setUser(prev => ({ ...prev, mfaEnabled: res.mfaEnabled }));
      }
      
      const secLogs = await apiRequest('/api/security/logs');
      setSecurityLogs(secLogs);
      return res;
    } catch (err) {
      throw err;
    }
  };

  // Payment Gateway UPI simulations
  const createPaymentOrder = async (amount, goalId) => {
    return await apiRequest('/api/payments/create-order', 'POST', { amount, goalId });
  };

  const triggerMockWebhook = async (webhookData) => {
    try {
      const res = await apiRequest('/api/payments/webhook', 'POST', webhookData);
      
      setGoals(prev => prev.map(g => g._id === webhookData.goalId ? { ...g, currentAmount: res.goal.currentAmount, completed: res.goal.completed } : g));
      
      const [summary, txsList, notificationsList] = await Promise.all([
        apiRequest('/api/transactions/summary'),
        apiRequest('/api/transactions'),
        apiRequest('/api/notifications')
      ]);
      setStats(summary);
      setTransactions(txsList);
      setNotifications(notificationsList);
      
      if (user) {
        setUser(prev => ({ ...prev, balance: summary.balance, savings: summary.savings, level: res.newLevel, xp: res.newXp }));
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const requestUpiPayout = async (goalId, amount, upiId) => {
    try {
      const res = await apiRequest('/api/payments/payout', 'POST', { goalId, amount, upiId });
      
      setGoals(prev => prev.map(g => g._id === goalId ? { ...g, currentAmount: res.goal.currentAmount, completed: res.goal.completed } : g));
      
      const [summary, txsList, notificationsList] = await Promise.all([
        apiRequest('/api/transactions/summary'),
        apiRequest('/api/transactions'),
        apiRequest('/api/notifications')
      ]);
      setStats(summary);
      setTransactions(txsList);
      setNotifications(notificationsList);
      
      if (user) {
        setUser(prev => ({ ...prev, balance: summary.balance, savings: summary.savings }));
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const addTransaction = async (txData) => {
    try {
      const newTx = await apiRequest('/api/transactions', 'POST', txData);
      setTransactions(prev => [newTx, ...prev]);
      
      const [summary, challengesList] = await Promise.all([
        apiRequest('/api/transactions/summary'),
        apiRequest('/api/challenges')
      ]);
      setStats(summary);
      setChallenges(challengesList);
      return newTx;
    } catch (err) {
      throw err;
    }
  };

  const deleteTransactionItem = async (txId) => {
    try {
      await apiRequest(`/api/transactions/${txId}`, 'DELETE');
      setTransactions(prev => prev.filter(t => t._id !== txId));
      
      const summary = await apiRequest('/api/transactions/summary');
      setStats(summary);
    } catch (err) {
      throw err;
    }
  };

  const createNewGoal = async (goalData) => {
    try {
      const newGoal = await apiRequest('/api/goals', 'POST', goalData);
      setGoals(prev => [...prev, newGoal]);
      return newGoal;
    } catch (err) {
      throw err;
    }
  };

  const depositIntoGoalItem = async (goalId, amount) => {
    try {
      const res = await apiRequest('/api/goals/deposit', 'POST', { goalId, amount });
      setGoals(prev => prev.map(g => g._id === goalId ? { ...g, currentAmount: res.goal.currentAmount, completed: res.goal.completed } : g));
      
      const [summary, txsList, notificationsList] = await Promise.all([
        apiRequest('/api/transactions/summary'),
        apiRequest('/api/transactions'),
        apiRequest('/api/notifications')
      ]);
      setStats(summary);
      setTransactions(txsList);
      setNotifications(notificationsList);
      if (user) {
        setUser(prev => ({ ...prev, balance: summary.balance, savings: summary.savings, level: res.newLevel, xp: res.newXp }));
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const withdrawFromGoalItem = async (goalId, amount, bypassMfa = false, biometricAuthorized = false) => {
    try {
      const res = await apiRequest('/api/goals/withdraw', 'POST', { 
        goalId, 
        amount, 
        bypassMfa, 
        biometricAuthorized 
      });
      
      if (res.status === 'success') {
        setGoals(prev => prev.map(g => g._id === goalId ? { ...g, currentAmount: res.goal.currentAmount, completed: res.goal.completed } : g));
        const [summary, txsList] = await Promise.all([
          apiRequest('/api/transactions/summary'),
          apiRequest('/api/transactions')
        ]);
        setStats(summary);
        setTransactions(txsList);
        if (user) {
          setUser(prev => ({ ...prev, balance: summary.balance, savings: summary.savings }));
        }
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const claimChallenge = async (challengeId) => {
    try {
      const res = await apiRequest('/api/challenges/claim', 'POST', { challengeId });
      setChallenges(prev => prev.map(c => c._id === challengeId ? { ...c, completed: true } : c));
      
      const [summary, notificationsList, badgesList] = await Promise.all([
        apiRequest('/api/transactions/summary'),
        apiRequest('/api/notifications'),
        apiRequest('/api/challenges/badges')
      ]);
      setStats(summary);
      setNotifications(notificationsList);
      setBadges(badgesList);
      if (user) {
        setUser(prev => ({ ...prev, xp: res.newXp, level: res.newLevel, badges: res.badges }));
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const addCustomChallengeItem = async (challengeData) => {
    try {
      const newChallenge = await apiRequest('/api/challenges/custom', 'POST', challengeData);
      setChallenges(prev => [newChallenge, ...prev]);
      return newChallenge;
    } catch (err) {
      throw err;
    }
  };

  const markNotificationRead = async (notifyId) => {
    try {
      await apiRequest(`/api/notifications/${notifyId}/read`, 'PUT');
      setNotifications(prev => prev.map(n => n._id === notifyId ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (value) => {
    const symbolMap = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    const symbol = symbolMap[user?.currency || 'INR'] || '₹';
    const formatter = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${symbol}${formatter.format(value || 0)}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      stats,
      goals,
      transactions,
      challenges,
      notifications,
      badges,
      securityStats,
      securityLogs,
      guardianAnalysis,
      signup,
      login,
      logout,
      updateProfileSettings,
      toggleEmergencyFreeze,
      revokeDeviceSession,
      toggleMFA,
      createPaymentOrder,
      triggerMockWebhook,
      requestUpiPayout,
      addTransaction,
      deleteTransactionItem,
      createNewGoal,
      depositIntoGoalItem,
      withdrawFromGoalItem,
      claimChallenge,
      addCustomChallengeItem,
      markNotificationRead,
      formatCurrency,
      fetchUserData,
      apiRequest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
