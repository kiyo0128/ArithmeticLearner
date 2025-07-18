"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REWARDS = exports.RANK_REQUIREMENTS = exports.insertRewardSchema = exports.insertAnswerSchema = exports.insertUserSchema = exports.insertQuestionSchema = exports.RewardSchema = exports.AnswerSchema = exports.UserSchema = exports.QuestionSchema = exports.sessions = exports.rewards = exports.answers = exports.questions = exports.users = exports.RANK = exports.QUESTION_TYPE = void 0;
var zod_1 = require("zod");
var pg_core_1 = require("drizzle-orm/pg-core");
// 問題の種類
exports.QUESTION_TYPE = {
    MATH: 'math',
    LANGUAGE: 'language'
};
// ランクの定義
exports.RANK = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
    DIAMOND: 'diamond'
};
// Database tables
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.varchar)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name').notNull(),
    password: (0, pg_core_1.varchar)('password').notNull(), // 4桁PIN
    totalScore: (0, pg_core_1.integer)('total_score').default(0),
    mathScore: (0, pg_core_1.integer)('math_score').default(0),
    languageScore: (0, pg_core_1.integer)('language_score').default(0),
    currentRank: (0, pg_core_1.varchar)('current_rank').default('bronze'),
    rewards: (0, pg_core_1.jsonb)('rewards').default([]),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.questions = (0, pg_core_1.pgTable)('questions', {
    id: (0, pg_core_1.varchar)('id').primaryKey(),
    type: (0, pg_core_1.varchar)('type').notNull(),
    question: (0, pg_core_1.text)('question').notNull(),
    answer: (0, pg_core_1.text)('answer').notNull(),
    choices: (0, pg_core_1.jsonb)('choices'),
    difficulty: (0, pg_core_1.integer)('difficulty').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.answers = (0, pg_core_1.pgTable)('answers', {
    id: (0, pg_core_1.varchar)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').notNull(),
    questionId: (0, pg_core_1.varchar)('question_id').notNull(),
    userAnswer: (0, pg_core_1.text)('user_answer').notNull(),
    isCorrect: (0, pg_core_1.boolean)('is_correct').notNull(),
    answeredAt: (0, pg_core_1.timestamp)('answered_at').defaultNow(),
});
exports.rewards = (0, pg_core_1.pgTable)('rewards', {
    id: (0, pg_core_1.varchar)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    requiredScore: (0, pg_core_1.integer)('required_score').notNull(),
    rank: (0, pg_core_1.varchar)('rank').notNull(),
    icon: (0, pg_core_1.varchar)('icon'),
});
// Session storage table for authentication
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    sid: (0, pg_core_1.varchar)('sid').primaryKey(),
    sess: (0, pg_core_1.jsonb)('sess').notNull(),
    expire: (0, pg_core_1.timestamp)('expire').notNull(),
}, function (table) { return [(0, pg_core_1.index)('IDX_session_expire').on(table.expire)]; });
// 問題データの型定義
exports.QuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum([exports.QUESTION_TYPE.MATH, exports.QUESTION_TYPE.LANGUAGE]),
    question: zod_1.z.string(),
    answer: zod_1.z.string(),
    choices: zod_1.z.array(zod_1.z.string()).optional(), // 国語の場合の選択肢
    difficulty: zod_1.z.number().min(1).max(5), // 難易度レベル
    createdAt: zod_1.z.date().default(function () { return new Date(); }),
});
// ユーザーデータの型定義
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    password: zod_1.z.string(),
    totalScore: zod_1.z.number().default(0),
    mathScore: zod_1.z.number().default(0),
    languageScore: zod_1.z.number().default(0),
    currentRank: zod_1.z.enum([exports.RANK.BRONZE, exports.RANK.SILVER, exports.RANK.GOLD, exports.RANK.PLATINUM, exports.RANK.DIAMOND]).default(exports.RANK.BRONZE),
    rewards: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.date().default(function () { return new Date(); }),
});
// 問題回答データの型定義
exports.AnswerSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    questionId: zod_1.z.string(),
    userAnswer: zod_1.z.string(),
    isCorrect: zod_1.z.boolean(),
    answeredAt: zod_1.z.date().default(function () { return new Date(); }),
});
// 特典データの型定義
exports.RewardSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    requiredScore: zod_1.z.number(),
    rank: zod_1.z.enum([exports.RANK.BRONZE, exports.RANK.SILVER, exports.RANK.GOLD, exports.RANK.PLATINUM, exports.RANK.DIAMOND]),
    icon: zod_1.z.string().optional(),
});
// Insert schemas (for creating new records)
exports.insertQuestionSchema = exports.QuestionSchema.omit({ id: true, createdAt: true });
exports.insertUserSchema = exports.UserSchema.omit({ id: true, createdAt: true });
exports.insertAnswerSchema = exports.AnswerSchema.omit({ id: true, answeredAt: true });
exports.insertRewardSchema = exports.RewardSchema.omit({ id: true });
// ランクアップに必要なスコア
exports.RANK_REQUIREMENTS = (_a = {},
    _a[exports.RANK.BRONZE] = 0,
    _a[exports.RANK.SILVER] = 50,
    _a[exports.RANK.GOLD] = 150,
    _a[exports.RANK.PLATINUM] = 300,
    _a[exports.RANK.DIAMOND] = 500,
    _a);
// 特典のデフォルトデータ
exports.DEFAULT_REWARDS = [
    {
        id: '1',
        name: '初心者バッジ',
        description: '最初の問題に正解！',
        requiredScore: 1,
        rank: exports.RANK.BRONZE,
        icon: '🎯',
    },
    {
        id: '2',
        name: '算数マスター',
        description: '算数問題を10問正解！',
        requiredScore: 10,
        rank: exports.RANK.BRONZE,
        icon: '🔢',
    },
    {
        id: '3',
        name: '国語エキスパート',
        description: '国語問題を15問正解！',
        requiredScore: 15,
        rank: exports.RANK.SILVER,
        icon: '📚',
    },
    {
        id: '4',
        name: '継続は力なり',
        description: '連続して25問正解！',
        requiredScore: 25,
        rank: exports.RANK.SILVER,
        icon: '💪',
    },
    {
        id: '5',
        name: '知識の泉',
        description: '総合スコア100達成！',
        requiredScore: 100,
        rank: exports.RANK.GOLD,
        icon: '⭐',
    },
    {
        id: '6',
        name: '学習王',
        description: '総合スコア300達成！',
        requiredScore: 300,
        rank: exports.RANK.PLATINUM,
        icon: '👑',
    },
    {
        id: '7',
        name: '完璧主義者',
        description: '総合スコア500達成！',
        requiredScore: 500,
        rank: exports.RANK.DIAMOND,
        icon: '💎',
    },
];
