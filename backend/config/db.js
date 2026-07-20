import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

const MONGODB_URI = process.env.MONGODB_URI;
const isMongoMode = !!MONGODB_URI;

// Setup database connectivity
if (isMongoMode) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✓ Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('✗ MongoDB Atlas connection error:', err.message));
} else {
  console.log('✓ No MONGODB_URI detected. Initializing Local JSON Database fallback...');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// --- MONGOOSE SCHEMAS & MODELS ---

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 10000.0 },
  savings: { type: Number, default: 0.0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 1 },
  lastActive: { type: String, default: () => new Date().toISOString() },
  passwordChangedAt: { type: String },
  currency: { type: String, default: 'INR' },
  language: { type: String, default: 'en' },
  darkMode: { type: Boolean, default: true },
  privacyMode: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  emergencyFrozen: { type: Boolean, default: false },
  dailyWithdrawalLimit: { type: Number, default: 50000 },
  failedAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: String, default: null },
  notifications: {
    billReminders: { type: Boolean, default: true },
    goalReminders: { type: Boolean, default: true },
    savingAlerts: { type: Boolean, default: true },
    aiAlerts: { type: Boolean, default: true }
  },
  goalLockEnabled: { type: Boolean, default: false },
  emergencyWithdrawalDelay: { type: Number, default: 24 },
  badges: [String],
  deviceHistory: [{
    device: String,
    ip: String,
    loginTime: String,
    location: String
  }],
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const goalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0.0 },
  deadline: { type: String, required: true },
  image: { type: String },
  category: { type: String, default: 'General' },
  completed: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  aiPrediction: {
    completionProbability: Number,
    smartSuggestion: String,
    motivationalQuote: String
  }
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true }, // 'income', 'expense', 'save', 'withdraw'
  category: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const challengeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, default: 'daily' },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  xpReward: { type: Number, default: 20 },
  completed: { type: Boolean, default: false },
  expiryDate: { type: String }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'general' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const logSchema = new mongoose.Schema({
  type: { type: String, default: 'SECURITY_ALERT' },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Instantiate MongoDB Models
const MongoUser = mongoose.model('User', userSchema);
const MongoGoal = mongoose.model('Goal', goalSchema);
const MongoTransaction = mongoose.model('Transaction', transactionSchema);
const MongoChallenge = mongoose.model('Challenge', challengeSchema);
const MongoNotification = mongoose.model('Notification', notificationSchema);
const MongoLog = mongoose.model('Log', logSchema);

// --- MONGOOSE ADAPTER CLASS ---

class MongoDatabaseAdapter {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}) {
    // Map JSON queries to standard Mongoose queries
    const results = await this.model.find(query).lean();
    // Return lean plain objects to preserve JSON structure matching JSON database
    return results;
  }

  async findOne(query = {}) {
    return await this.model.findOne(query).lean();
  }

  async findById(id) {
    return await this.model.findById(id).lean();
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async findByIdAndUpdate(id, updateData) {
    const doc = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    return doc ? doc.toObject() : null;
  }

  async findByIdAndDelete(id) {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async read() {
    // To support admin dashboards reading raw arrays
    return await this.model.find({}).lean();
  }
}

// --- LOCAL JSON FALLBACK DATABASE CLASS ---

class JsonDatabase {
  constructor(collectionName) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`Error reading collection ${this.filePath}`, e);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing collection ${this.filePath}`, e);
    }
  }

  async find(query = {}) {
    const items = this.read();
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = this.read();
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const items = this.read();
    return items.find(item => item._id === id) || null;
  }

  async create(data) {
    const items = this.read();
    const newItem = {
      _id: 'db_' + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    items[index] = { 
      ...items[index], 
      ...updateData, 
      updatedAt: new Date().toISOString() 
    };
    this.write(items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    this.write(items);
    return true;
  }
}

// Export database operations depending on mode
export const db = isMongoMode 
  ? {
      users: new MongoDatabaseAdapter(MongoUser),
      goals: new MongoDatabaseAdapter(MongoGoal),
      transactions: new MongoDatabaseAdapter(MongoTransaction),
      challenges: new MongoDatabaseAdapter(MongoChallenge),
      notifications: new MongoDatabaseAdapter(MongoNotification),
      logs: new MongoDatabaseAdapter(MongoLog)
    }
  : {
      users: new JsonDatabase('users'),
      goals: new JsonDatabase('goals'),
      transactions: new JsonDatabase('transactions'),
      challenges: new JsonDatabase('challenges'),
      notifications: new JsonDatabase('notifications'),
      logs: new JsonDatabase('logs')
    };
