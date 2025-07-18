import { Question, User, Answer, Reward, InsertQuestion, InsertUser, InsertAnswer, DEFAULT_REWARDS } from '../shared/schema';
import crypto from 'crypto';

// Firestore用のimport
import { db as firestoreDb, COLLECTIONS } from './firebase';

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

export class FirestoreStorage implements IStorage {
  constructor() {
    // Initialize with default rewards on first run
    this.initializeDefaultRewards();
  }

  private async initializeDefaultRewards() {
    try {
      // Check if rewards already exist
      const rewardsSnapshot = await firestoreDb.collection(COLLECTIONS.REWARDS).get();
      
      if (rewardsSnapshot.empty) {
        // Insert default rewards
        const batch = firestoreDb.batch();
        DEFAULT_REWARDS.forEach(reward => {
          const docRef = firestoreDb.collection(COLLECTIONS.REWARDS).doc(reward.id);
          batch.set(docRef, reward);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('Error initializing default rewards:', error);
    }
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      ...user,
      totalScore: user.totalScore || 0,
      mathScore: user.mathScore || 0,
      languageScore: user.languageScore || 0,
      currentRank: user.currentRank || 'bronze',
      rewards: user.rewards || [],
      createdAt: new Date(),
    };
    
    await firestoreDb.collection(COLLECTIONS.USERS).doc(id).set(newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const doc = await firestoreDb.collection(COLLECTIONS.USERS).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data();
    return {
      ...data,
      totalScore: data?.totalScore || 0,
      mathScore: data?.mathScore || 0,
      languageScore: data?.languageScore || 0,
      currentRank: data?.currentRank || 'bronze',
      rewards: data?.rewards || [],
      createdAt: data?.createdAt?.toDate() || new Date(),
    } as User;
  }

  async getUserByNameAndPassword(name: string, password: string): Promise<User | undefined> {
    const snapshot = await firestoreDb
      .collection(COLLECTIONS.USERS)
      .where('name', '==', name)
      .where('password', '==', password)
      .get();
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      totalScore: data?.totalScore || 0,
      mathScore: data?.mathScore || 0,
      languageScore: data?.languageScore || 0,
      currentRank: data?.currentRank || 'bronze',
      rewards: data?.rewards || [],
      createdAt: data?.createdAt?.toDate() || new Date(),
    } as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const docRef = firestoreDb.collection(COLLECTIONS.USERS).doc(id);
    
    await docRef.update(updates);
    
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error('User not found');
    }
    
    const data = doc.data();
    return {
      ...data,
      totalScore: data?.totalScore || 0,
      mathScore: data?.mathScore || 0,
      languageScore: data?.languageScore || 0,
      currentRank: data?.currentRank || 'bronze',
      rewards: data?.rewards || [],
      createdAt: data?.createdAt?.toDate() || new Date(),
    } as User;
  }

  // Question operations
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = crypto.randomUUID();
    const newQuestion: Question = {
      id,
      ...question,
      choices: question.choices || undefined,
      createdAt: new Date(),
    };
    
    await firestoreDb.collection(COLLECTIONS.QUESTIONS).doc(id).set(newQuestion);
    return newQuestion;
  }

  async saveQuestion(question: InsertQuestion, id?: string): Promise<Question> {
    const questionId = id || crypto.randomUUID();
    const newQuestion: Question = {
      id: questionId,
      ...question,
      choices: question.choices || undefined,
      createdAt: new Date(),
    };
    
    await firestoreDb.collection(COLLECTIONS.QUESTIONS).doc(questionId).set(newQuestion);
    return newQuestion;
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const doc = await firestoreDb.collection(COLLECTIONS.QUESTIONS).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data();
    return {
      ...data,
      type: data?.type as 'math' | 'language',
      choices: data?.choices || undefined,
      createdAt: data?.createdAt?.toDate() || new Date(),
    } as Question;
  }

  async getQuestionsByType(type: 'math' | 'language'): Promise<Question[]> {
    const snapshot = await firestoreDb
      .collection(COLLECTIONS.QUESTIONS)
      .where('type', '==', type)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        type: data.type as 'math' | 'language',
        choices: data.choices || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Question;
    });
  }

  // Answer operations
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = crypto.randomUUID();
    const newAnswer: Answer = {
      id,
      ...answer,
      answeredAt: new Date(),
    };
    
    await firestoreDb.collection(COLLECTIONS.ANSWERS).doc(id).set(newAnswer);
    return newAnswer;
  }

  async getAnswersByUserId(userId: string): Promise<Answer[]> {
    const snapshot = await firestoreDb
      .collection(COLLECTIONS.ANSWERS)
      .where('userId', '==', userId)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        answeredAt: data.answeredAt?.toDate() || new Date(),
      } as Answer;
    });
  }

  // Reward operations
  async getAllRewards(): Promise<Reward[]> {
    const snapshot = await firestoreDb.collection(COLLECTIONS.REWARDS).get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        rank: data.rank as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
        icon: data.icon || undefined,
      } as Reward;
    });
  }

  async getRewardsByRank(rank: string): Promise<Reward[]> {
    const snapshot = await firestoreDb
      .collection(COLLECTIONS.REWARDS)
      .where('rank', '==', rank)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        rank: data.rank as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
        icon: data.icon || undefined,
      } as Reward;
    });
  }
}