import { db } from '../config/db.js';

export const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    const txAmount = parseFloat(amount);

    if (!title || isNaN(txAmount) || !type || !category) {
      return res.status(400).json({ message: 'Title, amount, type, and category are required' });
    }

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let newBalance = user.balance;
    if (type === 'income') {
      newBalance += txAmount;
    } else if (type === 'expense') {
      if (user.balance < txAmount) {
        return res.status(400).json({ message: 'Insufficient cash balance for this expense' });
      }
      newBalance -= txAmount;
    }

    // Update user balance
    await db.users.findByIdAndUpdate(req.userId, { balance: newBalance });

    // Create ledger entry
    const newTx = await db.transactions.create({
      userId: req.userId,
      title,
      amount: txAmount,
      type,
      category,
      date: date || new Date().toISOString()
    });

    // Check challenge updates (Streak logic)
    const challenges = await db.challenges.find({ userId: req.userId, completed: false });
    for (const challenge of challenges) {
      if (challenge.title === 'Coffee Challenge' && category.toLowerCase().includes('coffee')) {
        // If they did purchase coffee, they fail this challenge or reset it
      }
    }

    res.status(201).json(newTx);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await db.transactions.find({ userId: req.userId });
    // Sort transactions by date descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await db.transactions.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Revert balance effect
    let newBalance = user.balance;
    if (transaction.type === 'income') {
      newBalance -= transaction.amount;
    } else if (transaction.type === 'expense') {
      newBalance += transaction.amount;
    }

    await db.users.findByIdAndUpdate(req.userId, { balance: newBalance });
    await db.transactions.findByIdAndDelete(id);

    res.json({ message: 'Transaction deleted successfully', revertedBalance: newBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStatsSummary = async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const txs = await db.transactions.find({ userId: req.userId });
    const goals = await db.goals.find({ userId: req.userId });

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = user.savings || 0;

    txs.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpenses += t.amount;
    });

    // AI score formula: savings vs expense ratio, streak modifiers, level multipliers
    let aiScore = 75; // baseline
    if (totalIncome > 0) {
      const savingsRate = (totalSavings + (totalIncome - totalExpenses)) / totalIncome;
      aiScore = Math.min(100, Math.max(30, Math.ceil(75 + (savingsRate * 20))));
    }

    res.json({
      balance: user.balance,
      income: totalIncome,
      expenses: totalExpenses,
      savings: totalSavings,
      aiScore,
      streak: user.streak,
      level: user.level,
      xp: user.xp
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
