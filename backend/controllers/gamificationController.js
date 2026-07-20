import { db } from '../config/db.js';

export const getChallenges = async (req, res) => {
  try {
    const challenges = await db.challenges.find({ userId: req.userId });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const claimChallengeReward = async (req, res) => {
  try {
    const { challengeId } = req.body;
    if (!challengeId) return res.status(400).json({ message: 'Challenge ID required' });

    const challenge = await db.challenges.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    if (challenge.completed) return res.status(400).json({ message: 'Reward already claimed' });

    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Mark challenge completed
    const updatedChallenge = await db.challenges.findByIdAndUpdate(challengeId, { completed: true });

    // Grant XP and check Level Up
    const newXp = user.xp + challenge.xpReward;
    const newLevel = Math.floor(newXp / 100) + 1;
    const levelUp = newLevel > user.level;

    // Badges array update on leveling up or specific challenge completions
    const updatedBadges = [...(user.badges || [])];
    if (levelUp && !updatedBadges.includes('Level Explorer')) {
      updatedBadges.push('Level Explorer');
    }
    if (challenge.title === 'No Shopping Week' && !updatedBadges.includes('Spartan Saver')) {
      updatedBadges.push('Spartan Saver');
    }

    await db.users.findByIdAndUpdate(req.userId, {
      xp: newXp,
      level: newLevel,
      badges: updatedBadges
    });

    // Create system notification
    await db.notifications.create({
      userId: req.userId,
      title: 'Challenge Completed! 🏆',
      body: `You unlocked the reward for "${challenge.title}" and gained ${challenge.xpReward} XP.`,
      type: 'achievement',
      read: false
    });

    res.json({
      challenge: updatedChallenge,
      xpGained: challenge.xpReward,
      levelUp,
      newLevel,
      newXp,
      badges: updatedBadges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addCustomChallenge = async (req, res) => {
  try {
    const { title, description, target, xpReward, type } = req.body;
    if (!title || !target) return res.status(400).json({ message: 'Title and target required' });

    const newChallenge = await db.challenges.create({
      userId: req.userId,
      title,
      description: description || 'Complete to earn XP.',
      type: type || 'daily',
      target,
      current: 0,
      xpReward: xpReward || 20,
      completed: false,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    res.status(201).json(newChallenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBadgesList = async (req, res) => {
  const allBadges = [
    { name: 'Level Explorer', description: 'Unlocked by reaching Level 2.', icon: 'Award', color: 'blue' },
    { name: 'Spartan Saver', description: 'Completed a No Shopping Week challenge.', icon: 'Shield', color: 'emerald' },
    { name: 'Consistency King', description: 'Maintain a 5-day active saving streak.', icon: 'Flame', color: 'amber' },
    { name: 'Gemini Scholar', description: 'Discussed finances with the AI Coach.', icon: 'Sparkles', color: 'purple' },
  ];

  try {
    const user = await db.users.findById(req.userId);
    const userBadgeNames = user?.badges || [];

    const statusList = allBadges.map(badge => ({
      ...badge,
      unlocked: userBadgeNames.includes(badge.name)
    }));

    res.json(statusList);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
