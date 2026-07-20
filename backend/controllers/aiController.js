import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../config/db.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback AI simulation logic
const generateSimulatedResponse = (promptType, userData, chatHistory = []) => {
  const { name, balance, savings, income, expenses, goals, txs } = userData;

  if (promptType === 'dashboard_insights') {
    const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;
    const expenseAlert = expenses > (income * 0.7) ? '⚠️ Warning: Your expenses are exceeding 70% of your income. Consider pausing non-essential purchases.' : '✅ Good job! Your expenses are well within the recommended 50/30/20 budget guidelines.';

    return [
      {
        title: 'AI Spend Analyzer',
        description: `Hey ${name}, you spent ₹${expenses} this month against an income of ₹${income}. Current savings rate is ${savingsRate}%.`,
        badge: 'Spend Insight',
        color: 'emerald'
      },
      {
        title: 'Smart Savings Alert',
        description: expenseAlert,
        badge: 'Budget Warning',
        color: expenses > (income * 0.7) ? 'amber' : 'blue'
      },
      {
        title: 'Goal Milestones',
        description: goals.length > 0 
          ? `Your goal "${goals[0].title}" is at ${Math.ceil((goals[0].currentAmount / goals[0].targetAmount) * 100)}% progress. Saving an extra ₹100 daily completes it 8 days early!`
          : 'Create a saving goal (e.g. Laptop, Emergency Fund) to start receiving automated AI progress optimization recommendations.',
        badge: 'Goal Boost',
        color: 'purple'
      }
    ];
  }

  if (promptType === 'savings_forecast') {
    // Projections for next 6 months
    const monthlyNet = Math.max(2000, income - expenses);
    const forecast = [];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let runningSavings = savings;

    for (let i = 0; i < 6; i++) {
      runningSavings += monthlyNet;
      // Add slight randomness to mock reality
      const variance = (Math.random() - 0.5) * 500;
      forecast.push({
        month: months[i],
        pessimistic: Math.ceil(runningSavings * 0.9 + variance),
        expected: Math.ceil(runningSavings + variance),
        optimistic: Math.ceil(runningSavings * 1.1 + variance)
      });
    }
    return forecast;
  }

  // Conversation chat response
  const lastMessage = chatHistory[chatHistory.length - 1]?.text || '';
  const msgLower = lastMessage.toLowerCase();

  if (msgLower.includes('hello') || msgLower.includes('hi')) {
    return `Hello ${name}! I am your SmartSave AI companion. I've analyzed your transaction history (₹${income} Income, ₹${expenses} Expenses, ₹${balance} Available). How can I assist you with your budget, savings goals, or spending challenges today?`;
  }
  if (msgLower.includes('budget') || msgLower.includes('plan')) {
    return `Based on your numbers, here is a custom **50/30/20 Budget Plan** for you:
- **Needs (50%)**: ₹${Math.ceil(income * 0.5)} (rent, bills, utilities)
- **Wants (30%)**: ₹${Math.ceil(income * 0.3)} (shopping, dining out, entertainment)
- **Savings (20%)**: ₹${Math.ceil(income * 0.2)} (allocated straight to your goals or emergency fund)

Currently, you spend ₹${expenses} which is about **${((expenses/income)*100).toFixed(0)}%** of your income. Adjusting your shopping category could free up ₹1,200 this week!`;
  }
  if (msgLower.includes('save') || msgLower.includes('invest') || msgLower.includes('rupee')) {
    return `To save more effectively:
1. **Automate**: Try setting up a daily automated transfer of **₹50** (equivalent to skipping one coffee).
2. **Goal Lock**: Enable the *Goal Lock* security feature in settings to enforce a 24-hour cooling delay on emergency withdrawals.
3. **Challenges**: Participate in our "Weekend Saving Challenge" or the "No Shopping Week" to earn additional XP and level up.`;
  }

  return `I understand you're asking about your finances. Your current net cash flow is **₹${income - expenses}** this month. To optimize this, I recommend setting a firm cap on dining and shopping categories. Would you like me to draft a weekly saving challenge or analyze a specific recent transaction for you, ${name}?`;
};

// Retrieve context details for AI
const getUserFinanceContext = async (userId) => {
  const user = await db.users.findById(userId);
  const txs = await db.transactions.find({ userId });
  const goals = await db.goals.find({ userId });

  let income = 0;
  let expenses = 0;
  txs.forEach(t => {
    if (t.type === 'income') income += t.amount;
    if (t.type === 'expense') expenses += t.amount;
  });

  return {
    name: user ? user.name : 'User',
    balance: user ? user.balance : 0,
    savings: user ? user.savings : 0,
    income: income || 25000, // Defaults for demo placeholder text
    expenses: expenses || 12000,
    goals,
    txs
  };
};

export const getAIInsights = async (req, res) => {
  try {
    const context = await getUserFinanceContext(req.userId);

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a premium, Apple-level private wealth coach for ${context.name}.
        Analyze their financial stats:
        Current Balance: ₹${context.balance}
        Savings: ₹${context.savings}
        Monthly Income: ₹${context.income}
        Monthly Expenses: ₹${context.expenses}
        Goals: ${JSON.stringify(context.goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })))}
        Recent Transactions: ${JSON.stringify(context.txs.slice(0, 5).map(t => ({ title: t.title, amount: t.amount, type: t.type })))}

        Provide 3 bulleted insights. Format the output strictly as a JSON array of objects:
        [
          {"title": "...", "description": "...", "badge": "...", "color": "emerald/amber/blue/purple"}
        ]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Clean JSON formatting from Gemini markdown block wrapper
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini API failed, using simulation.', geminiError.message);
      }
    }

    // Default simulation
    const insights = generateSimulatedResponse('dashboard_insights', context);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSavingsForecast = async (req, res) => {
  try {
    const context = await getUserFinanceContext(req.userId);
    const forecast = generateSimulatedResponse('savings_forecast', context);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const chatWithCoach = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    const context = await getUserFinanceContext(req.userId);
    const userMessage = messages[messages.length - 1]?.text || '';

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Assemble conversation history
        const chatPrompt = `You are a premium AI financial advisor for ${context.name}.
        Financial Profile: Balance ₹${context.balance}, Savings ₹${context.savings}, Income ₹${context.income}, Expenses ₹${context.expenses}.
        Active Saving Goals: ${context.goals.map(g => `${g.title} (₹${g.currentAmount}/₹${g.targetAmount})`).join(', ')}.
        
        Conversation history:
        ${messages.slice(-5).map(m => `${m.sender === 'user' ? 'User' : 'Advisor'}: ${m.text}`).join('\n')}
        
        Respond with direct, premium, professional financial advice. Keep it under 4 sentences. Use markdown bolding selectively.`;

        const result = await model.generateContent(chatPrompt);
        const reply = result.response.text();
        return res.json({ reply });
      } catch (geminiError) {
        console.warn('Gemini Chat failed, using simulated response.', geminiError.message);
      }
    }

    const reply = generateSimulatedResponse('chat', context, messages);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
