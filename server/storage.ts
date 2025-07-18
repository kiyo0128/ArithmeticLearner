import { Question, User, Answer, Reward, InsertQuestion, InsertUser, InsertAnswer, DEFAULT_REWARDS, users, questions, answers, rewards } from '../shared/schema';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByNameAndPassword(name: string, password: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  saveQuestion(question: InsertQuestion, id?: string): Promise<Question>;
  getQuestionById(id: string): Promise<Question | undefined>;
  getQuestionsByType(type: 'math' | 'language'): Promise<Question[]>;
  
  // Answer operations
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswersByUserId(userId: string): Promise<Answer[]>;
  
  // Reward operations
  getAllRewards(): Promise<Reward[]>;
  getRewardsByRank(rank: string): Promise<Reward[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private questions: Map<string, Question> = new Map();
  private answers: Map<string, Answer> = new Map();
  private rewards: Map<string, Reward> = new Map();

  constructor() {
    // Initialize with default rewards
    DEFAULT_REWARDS.forEach(reward => {
      this.rewards.set(reward.id, reward);
    });
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      ...user,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByNameAndPassword(name: string, password: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.name === name && user.password === password) {
        return user;
      }
    }
    return undefined;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Question operations
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = crypto.randomUUID();
    const newQuestion: Question = {
      id,
      ...question,
      createdAt: new Date(),
    };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async saveQuestion(question: InsertQuestion, id?: string): Promise<Question> {
    const questionId = id || crypto.randomUUID();
    const newQuestion: Question = {
      id: questionId,
      ...question,
      createdAt: new Date(),
    };
    this.questions.set(questionId, newQuestion);
    return newQuestion;
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsByType(type: 'math' | 'language'): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.type === type);
  }

  // Answer operations
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = crypto.randomUUID();
    const newAnswer: Answer = {
      id,
      ...answer,
      answeredAt: new Date(),
    };
    this.answers.set(id, newAnswer);
    return newAnswer;
  }

  async getAnswersByUserId(userId: string): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(a => a.userId === userId);
  }

  // Reward operations
  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async getRewardsByRank(rank: string): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(r => r.rank === rank);
  }
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default rewards on first run
    this.initializeDefaultRewards();
  }

  private async initializeDefaultRewards() {
    try {
      // Check if rewards already exist
      const existingRewards = await db.select().from(rewards);
      
      if (existingRewards.length === 0) {
        // Insert default rewards
        await db.insert(rewards).values(DEFAULT_REWARDS);
      }
    } catch (error) {
      console.error('Error initializing default rewards:', error);
    }
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const [newUser] = await db
      .insert(users)
      .values({
        id,
        ...user,
      })
      .returning();
    return {
      ...newUser,
      totalScore: newUser.totalScore || 0,
      mathScore: newUser.mathScore || 0,
      languageScore: newUser.languageScore || 0,
      currentRank: newUser.currentRank || 'bronze',
      rewards: Array.isArray(newUser.rewards) ? newUser.rewards : [],
      createdAt: newUser.createdAt || new Date(),
    } as User;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    return {
      ...user,
      totalScore: user.totalScore || 0,
      mathScore: user.mathScore || 0,
      languageScore: user.languageScore || 0,
      currentRank: user.currentRank || 'bronze',
      rewards: Array.isArray(user.rewards) ? user.rewards : [],
      createdAt: user.createdAt || new Date(),
    } as User;
  }

  async getUserByNameAndPassword(name: string, password: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.name, name), eq(users.password, password)));
    if (!user) return undefined;
    return {
      ...user,
      totalScore: user.totalScore || 0,
      mathScore: user.mathScore || 0,
      languageScore: user.languageScore || 0,
      currentRank: user.currentRank || 'bronze',
      rewards: Array.isArray(user.rewards) ? user.rewards : [],
      createdAt: user.createdAt || new Date(),
    } as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return {
      ...updatedUser,
      totalScore: updatedUser.totalScore || 0,
      mathScore: updatedUser.mathScore || 0,
      languageScore: updatedUser.languageScore || 0,
      currentRank: updatedUser.currentRank || 'bronze',
      rewards: Array.isArray(updatedUser.rewards) ? updatedUser.rewards : [],
      createdAt: updatedUser.createdAt || new Date(),
    } as User;
  }

  // Question operations
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = crypto.randomUUID();
    const [newQuestion] = await db
      .insert(questions)
      .values({
        id,
        ...question,
      })
      .returning();
    return {
      ...newQuestion,
      type: newQuestion.type as 'math' | 'language',
      choices: Array.isArray(newQuestion.choices) ? newQuestion.choices : undefined,
      createdAt: newQuestion.createdAt || new Date(),
    } as Question;
  }

  async saveQuestion(question: InsertQuestion, id?: string): Promise<Question> {
    const questionId = id || crypto.randomUUID();
    const [newQuestion] = await db
      .insert(questions)
      .values({
        id: questionId,
        ...question,
      })
      .returning();
    return {
      ...newQuestion,
      type: newQuestion.type as 'math' | 'language',
      choices: Array.isArray(newQuestion.choices) ? newQuestion.choices : undefined,
      createdAt: newQuestion.createdAt || new Date(),
    } as Question;
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    if (!question) return undefined;
    return {
      ...question,
      type: question.type as 'math' | 'language',
      choices: Array.isArray(question.choices) ? question.choices : undefined,
      createdAt: question.createdAt || new Date(),
    } as Question;
  }

  async getQuestionsByType(type: 'math' | 'language'): Promise<Question[]> {
    const results = await db.select().from(questions).where(eq(questions.type, type));
    return results.map(q => ({
      ...q,
      type: q.type as 'math' | 'language',
      choices: Array.isArray(q.choices) ? q.choices : undefined,
      createdAt: q.createdAt || new Date(),
    })) as Question[];
  }

  // Answer operations
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = crypto.randomUUID();
    const [newAnswer] = await db
      .insert(answers)
      .values({
        id,
        ...answer,
      })
      .returning();
    return {
      ...newAnswer,
      answeredAt: newAnswer.answeredAt || new Date(),
    } as Answer;
  }

  async getAnswersByUserId(userId: string): Promise<Answer[]> {
    const results = await db.select().from(answers).where(eq(answers.userId, userId));
    return results.map(a => ({
      ...a,
      answeredAt: a.answeredAt || new Date(),
    })) as Answer[];
  }

  // Reward operations
  async getAllRewards(): Promise<Reward[]> {
    const results = await db.select().from(rewards);
    return results.map(r => ({
      ...r,
      rank: r.rank as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
      icon: r.icon || undefined,
    })) as Reward[];
  }

  async getRewardsByRank(rank: string): Promise<Reward[]> {
    const results = await db.select().from(rewards).where(eq(rewards.rank, rank));
    return results.map(r => ({
      ...r,
      rank: r.rank as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
      icon: r.icon || undefined,
    })) as Reward[];
  }
}