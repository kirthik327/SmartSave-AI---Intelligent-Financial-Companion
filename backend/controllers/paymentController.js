import { db } from '../config/db.js';

export const createOrder = async (req, res) => {
  try {
    const { amount, goalId } = req.body;
    const orderAmt = parseFloat(amount);

    if (isNaN(orderAmt) || orderAmt <= 0 || !goalId) {
      return res.status(400).json({ message: 'Valid goal ID and positive amount required' });
    }

    const orderId = 'order_' + Math.random().toString(36).substring(2, 12);
    
    res.status(201).json({
      orderId,
      amount: orderAmt,
      currency: 'INR',
      merchantName: 'SmartSave AI Merchant Platform',
      keyId: 'rzp_test_ss_ai_58392019',
      goalId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating order' });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const { orderId, goalId, amount, paymentId, signature } = req.body;
    const depositAmt = parseFloat(amount);

    if (!orderId || !goalId || isNaN(depositAmt) || !paymentId) {
      return res.status(400).json({ message: 'Invalid webhook payload parameters' });
    }

    // Verify mock signature hash to mimic security
    if (signature !== 'mock_razorpay_signature_success') {
      return res.status(400).json({ message: 'Invalid payment signature verified. Webhook discarded.' });
    }

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.balance < depositAmt) {
      return res.status(400).json({ message: 'Insufficient cash balance for checkout settlement' });
    }

    const goal = await db.goals.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal target not found' });

    const newCurrent = goal.currentAmount + depositAmt;
    const isCompleted = newCurrent >= goal.targetAmount;

    // 1. Update goal
    const updatedGoal = await db.goals.findByIdAndUpdate(goalId, {
      currentAmount: newCurrent,
      completed: isCompleted
    });

    // 2. Adjust user available balance, savings, XP
    const xpGained = Math.ceil(depositAmt / 10);
    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;

    await db.users.findByIdAndUpdate(req.userId, {
      balance: user.balance - depositAmt,
      savings: user.savings + depositAmt,
      xp: newXp,
      level: newLevel
    });

    // 3. Create transactions entries for ledger
    await db.transactions.create({
      userId: req.userId,
      title: `Gateway Saved for: ${goal.title}`,
      amount: depositAmt,
      type: 'save',
      category: goal.category,
      date: new Date().toISOString(),
      metadata: { orderId, paymentId, processor: 'Razorpay UPI' }
    });

    // 4. Send successful notification alert
    await db.notifications.create({
      userId: req.userId,
      title: 'UPI Deposit Success 💳',
      body: `Successfully deposited ₹${depositAmt} to "${goal.title}" via GPay. Ref: ${paymentId}`,
      type: 'achievement',
      read: false
    });

    res.json({
      status: 'webhook_success',
      goal: updatedGoal,
      xpGained,
      levelUp: newLevel > user.level,
      newLevel,
      newXp
    });
  } catch (error) {
    console.error('Webhook callback failed', error);
    res.status(500).json({ message: 'Webhook callback execution failed' });
  }
};

export const handlePayout = async (req, res) => {
  try {
    const { goalId, amount, upiId } = req.body;
    const payoutAmt = parseFloat(amount);

    if (!goalId || isNaN(payoutAmt) || payoutAmt <= 0 || !upiId) {
      return res.status(400).json({ message: 'Valid goal ID, positive payout amount, and VPA UPI ID are required' });
    }

    // Verify VPA formatting syntax
    const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!vpaRegex.test(upiId)) {
      return res.status(400).json({ message: 'Invalid UPI ID format. Please use standard syntax (e.g. user@bank)' });
    }

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emergencyFrozen) {
      return res.status(403).json({ message: 'Payout channels are disabled. Account is under Emergency Lock.' });
    }

    const goal = await db.goals.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal target not found' });

    if (goal.currentAmount < payoutAmt) {
      return res.status(400).json({ message: 'Cannot withdraw more than current savings' });
    }

    // Process simulated RazorpayX payout transfer
    const payoutId = 'payout_' + Math.random().toString(36).substring(2, 12);

    // Adjust balances
    const updatedGoal = await db.goals.findByIdAndUpdate(goalId, {
      currentAmount: goal.currentAmount - payoutAmt,
      completed: (goal.currentAmount - payoutAmt) >= goal.targetAmount
    });

    await db.users.findByIdAndUpdate(req.userId, {
      balance: user.balance + payoutAmt,
      savings: Math.max(0, user.savings - payoutAmt)
    });

    // Create payout logs
    await db.transactions.create({
      userId: req.userId,
      title: `UPI Payout: ${goal.title}`,
      amount: payoutAmt,
      type: 'withdraw',
      category: goal.category,
      date: new Date().toISOString(),
      metadata: { payoutId, upiId, processor: 'RazorpayX' }
    });

    await db.notifications.create({
      userId: req.userId,
      title: 'UPI Payout Released 💸',
      body: `Transferred ₹${payoutAmt} from "${goal.title}" directly to UPI ID ${upiId}. Ref: ${payoutId}`,
      type: 'security',
      read: false
    });

    res.json({
      status: 'success',
      payoutId,
      goal: updatedGoal,
      message: `Instant UPI payout of ₹${payoutAmt} transferred to ${upiId} successfully.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error processing payout' });
  }
};
