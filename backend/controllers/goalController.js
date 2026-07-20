import { db } from '../config/db.js';

export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, image, category } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ message: 'Title, target amount, and deadline are required' });
    }

    const defaultImages = {
      laptop: 'https://images.unsplash.com/photo-1496181130204-7552cc15545a?w=400',
      bike: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      vacation: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400',
      house: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
      emergency: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400',
      default: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400'
    };

    const searchKeyword = (category || title).toLowerCase();
    let goalImage = image;

    if (!goalImage) {
      if (searchKeyword.includes('laptop') || searchKeyword.includes('computer')) goalImage = defaultImages.laptop;
      else if (searchKeyword.includes('bike') || searchKeyword.includes('cycle')) goalImage = defaultImages.bike;
      else if (searchKeyword.includes('vacation') || searchKeyword.includes('trip') || searchKeyword.includes('travel')) goalImage = defaultImages.vacation;
      else if (searchKeyword.includes('car')) goalImage = defaultImages.car;
      else if (searchKeyword.includes('house') || searchKeyword.includes('home')) goalImage = defaultImages.house;
      else if (searchKeyword.includes('emergency') || searchKeyword.includes('fund') || searchKeyword.includes('save')) goalImage = defaultImages.emergency;
      else goalImage = defaultImages.default;
    }

    const dailyRequired = parseFloat(targetAmount) / Math.max(1, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)));
    const aiPrediction = {
      completionProbability: 82,
      smartSuggestion: `To hit this by your deadline, try setting aside ₹${Math.ceil(dailyRequired)} daily. Skipping one premium purchase per week will speed this up by 12%.`,
      motivationalQuote: 'Every small rupee saved brings you one step closer to your dream.'
    };

    const newGoal = await db.goals.create({
      userId: req.userId,
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0.0,
      deadline,
      image: goalImage,
      category: category || 'General',
      completed: false,
      locked: false,
      aiPrediction
    });

    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await db.goals.find({ userId: req.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const depositToGoal = async (req, res) => {
  try {
    const { goalId, amount } = req.body;
    const depositAmt = parseFloat(amount);

    if (!goalId || isNaN(depositAmt) || depositAmt <= 0) {
      return res.status(400).json({ message: 'Valid goal ID and positive deposit amount are required' });
    }

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Block transactions if account is frozen
    if (user.emergencyFrozen) {
      return res.status(403).json({ message: 'Deposits are suspended. Account is currently under Emergency Freeze.' });
    }

    if (user.balance < depositAmt) {
      return res.status(400).json({ message: 'Insufficient balance to deposit into goal' });
    }

    const goal = await db.goals.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const newCurrent = goal.currentAmount + depositAmt;
    const isCompleted = newCurrent >= goal.targetAmount;

    const updatedGoal = await db.goals.findByIdAndUpdate(goalId, {
      currentAmount: newCurrent,
      completed: isCompleted
    });

    const xpGained = Math.ceil(depositAmt / 10);
    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;

    await db.users.findByIdAndUpdate(req.userId, {
      balance: user.balance - depositAmt,
      savings: user.savings + depositAmt,
      xp: newXp,
      level: newLevel
    });

    await db.transactions.create({
      userId: req.userId,
      title: `Saved for: ${goal.title}`,
      amount: depositAmt,
      type: 'save',
      category: goal.category,
      date: new Date().toISOString()
    });

    if (isCompleted) {
      await db.notifications.create({
        userId: req.userId,
        title: 'Goal Achieved! 🎉',
        body: `Congratulations! You saved the full amount for "${goal.title}"! Enjoy your reward.`,
        type: 'achievement',
        read: false
      });
    }

    res.json({
      goal: updatedGoal,
      xpGained,
      levelUp: newLevel > user.level,
      newLevel,
      newXp
    });
  } catch (error) {
    console.error('Deposit error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const withdrawFromGoal = async (req, res) => {
  try {
    const { goalId, amount, bypassMfa, biometricAuthorized } = req.body;
    const withdrawAmt = parseFloat(amount);

    if (!goalId || isNaN(withdrawAmt) || withdrawAmt <= 0) {
      return res.status(400).json({ message: 'Valid goal ID and positive amount are required' });
    }

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Block withdrawals if account is frozen
    if (user.emergencyFrozen) {
      return res.status(403).json({ 
        message: 'Withdrawals are suspended. Account is currently under Emergency Lock.' 
      });
    }

    // Enforce Daily Limit Checks
    const todayStr = new Date().toISOString().split('T')[0];
    const userTxs = await db.transactions.find({ userId: req.userId, type: 'withdraw' });
    const todayTotal = userTxs
      .filter(t => t.date.startsWith(todayStr))
      .reduce((acc, t) => acc + t.amount, 0);

    const limit = user.dailyWithdrawalLimit || 50000;
    if (todayTotal + withdrawAmt > limit) {
      return res.status(400).json({
        message: `Withdrawal request of ₹${withdrawAmt} exceeds your Daily Withdrawal Limit of ₹${limit}. Remaining limit: ₹${Math.max(0, limit - todayTotal)}.`
      });
    }

    // Guardian AI Threat Check on High Value Withdrawals (exceeding ₹20,000)
    if (withdrawAmt > 20000 && !bypassMfa) {
      // Calculate fake risk score
      const riskScore = Math.ceil(70 + (withdrawAmt / 10000));
      
      // Log anomaly attempt
      await db.logs.create({
        type: 'SECURITY_ALERT',
        message: `Guardian AI flagged high-value withdrawal request (₹${withdrawAmt}) with Risk Score: ${riskScore}%`,
        metadata: { goalId, amount: withdrawAmt }
      });

      return res.json({
        status: 'mfa_required',
        message: 'Guardian AI detected high cash outflow velocity. Verification required.',
        riskScore,
        confidence: 96
      });
    }

    // Verification check validation
    if (withdrawAmt > 20000 && bypassMfa && !biometricAuthorized) {
      return res.status(400).json({ message: 'Impulse override protection failed. Biometrics missing.' });
    }

    const goal = await db.goals.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (goal.currentAmount < withdrawAmt) {
      return res.status(400).json({ message: 'Cannot withdraw more than current savings' });
    }

    // Goal Lock delay buffer
    if (user.goalLockEnabled && !bypassMfa) {
      const delay = user.emergencyWithdrawalDelay || 24;
      const releaseTime = new Date(Date.now() + delay * 60 * 60 * 1000).toISOString();

      await db.notifications.create({
        userId: req.userId,
        title: 'Emergency Withdrawal Locked 🔒',
        body: `Withdrawal of ₹${withdrawAmt} from "${goal.title}" is pending security delay and will release in ${delay} hours.`,
        type: 'security',
        read: false
      });

      return res.json({
        status: 'pending_lock',
        message: `Goal lock enabled. Emergency withdrawal scheduled to release in ${delay} hours.`,
        releaseTime
      });
    }

    // Execute Withdrawal
    const updatedGoal = await db.goals.findByIdAndUpdate(goalId, {
      currentAmount: goal.currentAmount - withdrawAmt,
      completed: (goal.currentAmount - withdrawAmt) >= goal.targetAmount
    });

    await db.users.findByIdAndUpdate(req.userId, {
      balance: user.balance + withdrawAmt,
      savings: Math.max(0, user.savings - withdrawAmt)
    });

    await db.transactions.create({
      userId: req.userId,
      title: `Withdrew from: ${goal.title}`,
      amount: withdrawAmt,
      type: 'withdraw',
      category: goal.category,
      date: new Date().toISOString()
    });

    res.json({
      status: 'success',
      goal: updatedGoal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
