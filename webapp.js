#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🚀 学習Webアプリケーションを起動しています...');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// In-memory storage for the web app
const webAppStorage = {
  users: new Map(),
  questions: new Map(),
  answers: new Map(),
  rewards: new Map(),
  sessions: new Map(),
  nextId: 1,
  
  init() {
    // Initialize with sample rewards
    const rewards = [
      { id: 'reward_1', name: 'はじめの一歩', description: '最初の正解！', requiredScore: 1, icon: '🎉', rank: '初心者' },
      { id: 'reward_2', name: '学習の星', description: '5問正解', requiredScore: 5, icon: '⭐', rank: '初心者' },
      { id: 'reward_3', name: '努力の証', description: '10問正解', requiredScore: 10, icon: '🏆', rank: '中級者' },
      { id: 'reward_4', name: '知識の宝庫', description: '25問正解', requiredScore: 25, icon: '📚', rank: '中級者' },
      { id: 'reward_5', name: '学習マスター', description: '50問正解', requiredScore: 50, icon: '👑', rank: '上級者' },
      { id: 'reward_6', name: '完璧主義者', description: '100問正解', requiredScore: 100, icon: '💎', rank: '達人' },
    ];
    
    rewards.forEach(reward => {
      this.rewards.set(reward.id, reward);
    });
    
    console.log('✅ ストレージが初期化されました');
  },
  
  generateId() {
    return `user_${Date.now()}_${this.nextId++}`;
  },
  
  createUser(userData) {
    const user = {
      id: this.generateId(),
      name: userData.name || 'ゲスト',
      mathScore: 0,
      languageScore: 0,
      totalScore: 0,
      rank: '初心者',
      achievements: [],
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  },
  
  getUserById(id) {
    return this.users.get(id);
  },
  
  updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updated = { ...user, ...updates };
    
    // Update rank based on total score
    if (updated.totalScore >= 100) updated.rank = '達人';
    else if (updated.totalScore >= 50) updated.rank = '上級者';
    else if (updated.totalScore >= 25) updated.rank = '中級者';
    else if (updated.totalScore >= 5) updated.rank = '初心者';
    
    this.users.set(id, updated);
    return updated;
  },
  
  getAllRewards() {
    return Array.from(this.rewards.values());
  }
};

// Initialize storage
webAppStorage.init();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// API Routes for the web app
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '学習Webアプリが正常に動作しています',
    timestamp: new Date().toISOString(),
    users: webAppStorage.users.size,
    questions: webAppStorage.questions.size
  });
});

// User management
app.post('/api/users', (req, res) => {
  try {
    const userData = req.body;
    const user = webAppStorage.createUser(userData);
    console.log(`✅ 新しいユーザーが作成されました: ${user.name} (ID: ${user.id})`);
    res.json(user);
  } catch (error) {
    console.error('❌ ユーザー作成エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = webAppStorage.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ ユーザー取得エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const updates = req.body;
    const user = webAppStorage.updateUser(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    console.log(`✅ ユーザーが更新されました: ${user.name} (スコア: ${user.totalScore})`);
    res.json(user);
  } catch (error) {
    console.error('❌ ユーザー更新エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// Question generation
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { type, difficulty } = req.body;
    
    console.log(`🤖 問題生成開始: ${type}, 難易度: ${difficulty}`);
    
    let prompt;
    if (type === 'math') {
      prompt = `${difficulty || '初級'}レベルの算数問題を1問作成してください。

例：
問題: 25 + 37
答え: 62

${difficulty || '初級'}レベルに適した計算問題を作成してください。
フォーマット：
問題: [計算式]
答え: [数値のみ]`;
    } else if (type === 'language') {
      prompt = `${difficulty || '初級'}レベルの国語問題を1問作成してください。5択の選択肢を含めてください。

例：
問題: 「美しい」の反対語はどれですか？
選択肢:
1. きれい
2. 汚い
3. 大きい
4. 小さい
5. 赤い
答え: 2

${difficulty || '初級'}レベルに適した国語問題を作成してください。
フォーマット：
問題: [国語問題]
選択肢:
1. [選択肢1]
2. [選択肢2]
3. [選択肢3]
4. [選択肢4]
5. [選択肢5]
答え: [正解の番号]`;
    } else {
      return res.status(400).json({ error: '無効な問題タイプです' });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 AI応答:', text);
    
    // Parse the response
    const lines = text.split('\n').filter(line => line.trim());
    let question = '';
    let answer = '';
    let options = [];
    
    for (const line of lines) {
      if (line.startsWith('問題:')) {
        question = line.replace('問題:', '').trim();
      } else if (line.startsWith('答え:')) {
        answer = line.replace('答え:', '').trim();
      } else if (line.match(/^\d+\./)) {
        options.push(line.trim());
      }
    }
    
    // Generate unique ID for this question
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const questionData = {
      id: questionId,
      question: question || '問題の解析に失敗しました',
      answer: answer || '1',
      type: type,
      difficulty: difficulty || '初級',
      options: type === 'language' ? options : [],
      createdAt: new Date().toISOString()
    };
    
    webAppStorage.questions.set(questionId, questionData);
    
    console.log(`✅ 問題が生成されました: ${questionData.question}`);
    res.json(questionData);
  } catch (error) {
    console.error('❌ 問題生成エラー:', error);
    res.status(500).json({ 
      error: '問題の生成に失敗しました',
      details: error.message 
    });
  }
});

// Answer submission
app.post('/api/answers', (req, res) => {
  try {
    const { questionId, userId, userAnswer, isCorrect } = req.body;
    
    const answerId = `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const answerData = {
      id: answerId,
      questionId,
      userId,
      userAnswer,
      isCorrect,
      answeredAt: new Date().toISOString()
    };
    
    webAppStorage.answers.set(answerId, answerData);
    
    console.log(`✅ 回答が記録されました: ${userAnswer} (正解: ${isCorrect})`);
    res.json(answerData);
  } catch (error) {
    console.error('❌ 回答記録エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rewards
app.get('/api/rewards', (req, res) => {
  try {
    const rewards = webAppStorage.getAllRewards();
    res.json(rewards);
  } catch (error) {
    console.error('❌ 特典取得エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user rewards based on score
app.get('/api/users/:id/rewards', (req, res) => {
  try {
    const user = webAppStorage.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    
    const allRewards = webAppStorage.getAllRewards();
    const earnedRewards = allRewards.filter(reward => user.totalScore >= reward.requiredScore);
    
    res.json(earnedRewards);
  } catch (error) {
    console.error('❌ ユーザー特典取得エラー:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Start the web application server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🌐 ========================================');
  console.log('🚀 学習Webアプリケーションが起動しました！');
  console.log('🌐 ========================================');
  console.log(`📱 アクセスURL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log('');
  console.log('📚 利用可能な機能:');
  console.log('  ✅ AI生成問題（算数・国語）');
  console.log('  ✅ テンキー入力システム');
  console.log('  ✅ 5択選択システム');
  console.log('  ✅ スコア管理とランクアップ');
  console.log('  ✅ 特典・リワードシステム');
  console.log('  ✅ ユーザー管理機能');
  console.log('');
  console.log('🎯 ブラウザでアクセスして学習を開始してください！');
  console.log('========================================');
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ 予期しないエラー:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未処理のPromise拒否:', reason);
});