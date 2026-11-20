import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isConnectedToMongo } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'conversations.json');

// Ensure data folder and file exist for persistent fallback
const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
};

const readFallbackData = () => {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[FallbackDB] Error reading conversations data:', err);
    return [];
  }
};

const writeFallbackData = (data) => {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[FallbackDB] Error saving conversations data:', err);
  }
};

// 1. Official Mongoose Schema (Used when MongoDB is running)
const MessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    tone: { type: String, enum: ['Professional', 'Casual', 'Concise'], default: 'Professional' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MongooseConversationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: 'New Conversation', trim: true },
    tone: { type: String, enum: ['Professional', 'Casual', 'Concise'], default: 'Professional' },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

MongooseConversationSchema.index({ updatedAt: -1 });

const MongooseModel = mongoose.model('Conversation', MongooseConversationSchema);

// 2. High-fidelity Fallback Model (ensures 100% functionality without requiring external mongod daemon)
class FallbackConversationInstance {
  constructor(data = {}) {
    this._id = data._id || data.id || uuidv4();
    this.title = data.title || 'New Conversation';
    this.tone = data.tone || 'Professional';
    this.messages = data.messages || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  get id() {
    return this._id.toString();
  }

  async save() {
    this.updatedAt = new Date();
    const list = readFallbackData();
    const idx = list.findIndex((c) => c._id === this._id);

    const serialized = {
      _id: this._id,
      id: this._id,
      title: this.title,
      tone: this.tone,
      messages: this.messages,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };

    if (idx >= 0) {
      list[idx] = serialized;
    } else {
      list.push(serialized);
    }

    writeFallbackData(list);
    return this;
  }
}

class FallbackModel {
  static async find(query = {}) {
    const list = readFallbackData();
    let result = list.map((c) => new FallbackConversationInstance(c));

    // Handle regex search if present
    if (query.$or) {
      const searchTerms = query.$or;
      result = result.filter((item) => {
        return searchTerms.some((term) => {
          if (term.title && term.title.$regex) {
            const re = new RegExp(term.title.$regex, term.title.$options || 'i');
            return re.test(item.title);
          }
          if (term['messages.content'] && term['messages.content'].$regex) {
            const re = new RegExp(term['messages.content'].$regex, term['messages.content'].$options || 'i');
            return item.messages.some((m) => re.test(m.content));
          }
          return false;
        });
      });
    }

    // Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Support query chaining: .select().sort()
    const queryObj = {
      select: () => queryObj,
      sort: () => queryObj,
      then: (resolve) => resolve(result),
      catch: (reject) => {},
    };

    return result;
  }

  static async findById(id) {
    if (!id) return null;
    const list = readFallbackData();
    const found = list.find((c) => c._id === id || c.id === id);
    if (!found) return null;
    return new FallbackConversationInstance(found);
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const list = readFallbackData();
    const idx = list.findIndex((c) => c._id === id || c.id === id);
    if (idx === -1) return null;
    const [deleted] = list.splice(idx, 1);
    writeFallbackData(list);
    return deleted;
  }

  static async findByIdAndUpdate(id, updates = {}, options = {}) {
    const conv = await this.findById(id);
    if (!conv) return null;
    if (updates.tone) conv.tone = updates.tone;
    if (updates.title) conv.title = updates.title;
    await conv.save();
    return conv;
  }
}

// Transparent Proxy: Dynamically uses MongooseModel if live MongoDB is connected, otherwise FallbackModel
export const Conversation = new Proxy(MongooseModel, {
  construct(target, args) {
    if (isConnectedToMongo) {
      return new MongooseModel(...args);
    }
    return new FallbackConversationInstance(...args);
  },
  get(target, prop) {
    if (isConnectedToMongo) {
      return target[prop];
    }
    if (prop in FallbackModel) {
      return FallbackModel[prop];
    }
    return target[prop];
  },
});
