import { z } from 'zod';
import { pgTable, text, integer, boolean, timestamp, varchar, jsonb, index } from 'drizzle-orm/pg-core';

// 問題の種類
export const QUESTION_TYPE = {
  MATH: 'math',
  LANGUAGE: 'language'
} as const;

// ランクの定義
export const RANK = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond'
} as const;

// Database tables
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  password: varchar('password').notNull(), // 4桁PIN
  totalScore: integer('total_score').default(0),
  mathScore: integer('math_score').default(0),
  languageScore: integer('language_score').default(0),
  currentRank: varchar('current_rank').default('bronze'),
  rewards: jsonb('rewards').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const questions = pgTable('questions', {
  id: varchar('id').primaryKey(),
  type: varchar('type').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  choices: jsonb('choices'),
  difficulty: integer('difficulty').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const answers = pgTable('answers', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  questionId: varchar('question_id').notNull(),
  userAnswer: text('user_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  answeredAt: timestamp('answered_at').defaultNow(),
});

export const rewards = pgTable('rewards', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description').notNull(),
  requiredScore: integer('required_score').notNull(),
  rank: varchar('rank').notNull(),
  icon: varchar('icon'),
});

// Session storage table for authentication
export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)]
);

// 問題データの型定義
export const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum([QUESTION_TYPE.MATH, QUESTION_TYPE.LANGUAGE]),
  question: z.string(),
  answer: z.string(),
  choices: z.array(z.string()).optional(), // 国語の場合の選択肢
  difficulty: z.number().min(1).max(5), // 難易度レベル
  createdAt: z.date().default(() => new Date()),
});

// ユーザーデータの型定義
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  password: z.string(),
  totalScore: z.number().default(0),
  mathScore: z.number().default(0),
  languageScore: z.number().default(0),
  currentRank: z.enum([RANK.BRONZE, RANK.SILVER, RANK.GOLD, RANK.PLATINUM, RANK.DIAMOND]).default(RANK.BRONZE),
  rewards: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
});

// 問題回答データの型定義
export const AnswerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  questionId: z.string(),
  userAnswer: z.string(),
  isCorrect: z.boolean(),
  answeredAt: z.date().default(() => new Date()),
});

// 特典データの型定義
export const RewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  requiredScore: z.number(),
  rank: z.enum([RANK.BRONZE, RANK.SILVER, RANK.GOLD, RANK.PLATINUM, RANK.DIAMOND]),
  icon: z.string().optional(),
});

// Insert schemas (for creating new records)
export const insertQuestionSchema = QuestionSchema.omit({ id: true, createdAt: true });
export const insertUserSchema = UserSchema.omit({ id: true, createdAt: true });
export const insertAnswerSchema = AnswerSchema.omit({ id: true, answeredAt: true });
export const insertRewardSchema = RewardSchema.omit({ id: true });

// Types for use in the application
export type Question = z.infer<typeof QuestionSchema>;
export type User = z.infer<typeof UserSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Reward = z.infer<typeof RewardSchema>;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type InsertReward = z.infer<typeof insertRewardSchema>;

// ランクアップに必要なスコア
export const RANK_REQUIREMENTS = {
  [RANK.BRONZE]: 0,
  [RANK.SILVER]: 50,
  [RANK.GOLD]: 150,
  [RANK.PLATINUM]: 300,
  [RANK.DIAMOND]: 500,
} as const;

// 特典のデフォルトデータ
export const DEFAULT_REWARDS: Reward[] = [
  {
    id: '1',
    name: '初心者バッジ',
    description: '最初の問題に正解！',
    requiredScore: 1,
    rank: RANK.BRONZE,
    icon: '🎯',
  },
  {
    id: '2',
    name: '算数マスター',
    description: '算数問題を10問正解！',
    requiredScore: 10,
    rank: RANK.BRONZE,
    icon: '🔢',
  },
  {
    id: '3',
    name: '国語エキスパート',
    description: '国語問題を15問正解！',
    requiredScore: 15,
    rank: RANK.SILVER,
    icon: '📚',
  },
  {
    id: '4',
    name: '継続は力なり',
    description: '連続して25問正解！',
    requiredScore: 25,
    rank: RANK.SILVER,
    icon: '💪',
  },
  {
    id: '5',
    name: '知識の泉',
    description: '総合スコア100達成！',
    requiredScore: 100,
    rank: RANK.GOLD,
    icon: '⭐',
  },
  {
    id: '6',
    name: '学習王',
    description: '総合スコア300達成！',
    requiredScore: 300,
    rank: RANK.PLATINUM,
    icon: '👑',
  },
  {
    id: '7',
    name: '完璧主義者',
    description: '総合スコア500達成！',
    requiredScore: 500,
    rank: RANK.DIAMOND,
    icon: '💎',
  },
];