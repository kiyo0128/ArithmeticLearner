#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// In-memory storage
const storage = {
  users: new Map(),
  questions: new Map(),
  answers: new Map(),
  rewards: new Map(),
  nextId: 1,
  
  // Initialize with default rewards
  init() {
    const defaultRewards = [
      { id: 'reward_1', name: 'はじめの一歩', description: '最初の正解！', requiredScore: 1, icon: '🎉' },
      { id: 'reward_2', name: '学習の星', description: '5問正解', requiredScore: 5, icon: '⭐' },
      { id: 'reward_3', name: '努力の証', description: '10問正解', requiredScore: 10, icon: '🏆' },
      { id: 'reward_4', name: '知識の宝庫', description: '25問正解', requiredScore: 25, icon: '📚' },
      { id: 'reward_5', name: '学習マスター', description: '50問正解', requiredScore: 50, icon: '👑' },
    ];
    
    defaultRewards.forEach(reward => {
      this.rewards.set(reward.id, reward);
    });
  },
  
  generateId() {
    return `id_${this.nextId++}`;
  },
  
  createUser(userData) {
    const user = {
      id: this.generateId(),
      ...userData,
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
    this.users.set(id, updated);
    return updated;
  },
  
  createQuestion(questionData) {
    const question = {
      id: this.generateId(),
      ...questionData,
      createdAt: new Date().toISOString(),
    };
    this.questions.set(question.id, question);
    return question;
  },
  
  getQuestionById(id) {
    return this.questions.get(id);
  },
  
  createAnswer(answerData) {
    const answer = {
      id: this.generateId(),
      ...answerData,
      answeredAt: new Date().toISOString(),
    };
    this.answers.set(answer.id, answer);
    return answer;
  },
  
  getAllRewards() {
    return Array.from(this.rewards.values());
  }
};

// Initialize storage
storage.init();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function getRankPriority(rank) {
  const priorities = {
    '初心者': 0,
    '中級者': 1,
    '上級者': 2,
    '達人': 3,
    '大師': 4
  };
  return priorities[rank] || 0;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '学習アプリが正常に動作しています' });
});

app.post('/api/users', (req, res) => {
  try {
    const userData = req.body;
    const user = storage.createUser(userData);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = storage.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const updates = req.body;
    const user = storage.updateUser(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/questions/generate', async (req, res) => {
  try {
    const { type, difficulty } = req.body;
    
    let prompt;
    if (type === 'math') {
      prompt = `${difficulty}レベルの算数問題を1問作成してください。問題と答えを数値で返してください。
      
      例：
      問題: 25 + 37 = ?
      答え: 62
      
      フォーマット：
      問題: [算数問題]
      答え: [数値のみ]`;
    } else {
      prompt = `${difficulty}レベルの国語問題を1問作成してください。5択の選択肢を含めてください。
      
      例：
      問題: 「美しい」の反対語はどれですか？
      選択肢:
      1. きれい
      2. 汚い
      3. 大きい
      4. 小さい
      5. 赤い
      答え: 2
      
      フォーマット：
      問題: [国語問題]
      選択肢:
      1. [選択肢1]
      2. [選択肢2]
      3. [選択肢3]
      4. [選択肢4]
      5. [選択肢5]
      答え: [番号]`;
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
    
    const questionData = {
      question,
      answer,
      type,
      difficulty,
      options: type === 'language' ? options : []
    };
    
    const savedQuestion = storage.createQuestion(questionData);
    res.json(savedQuestion);
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

app.post('/api/answers', (req, res) => {
  try {
    const answerData = req.body;
    const answer = storage.createAnswer(answerData);
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rewards', (req, res) => {
  try {
    const rewards = storage.getAllRewards();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 学習アプリケーションサーバーが起動しました！');
  console.log(`🌐 アクセスURL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('📚 算数・国語問題アプリが利用可能です！');
  console.log('');
  console.log('機能一覧:');
  console.log('- AI生成問題（算数・国語）');
  console.log('- テンキー入力システム');
  console.log('- 5択選択システム');
  console.log('- スコア管理とランクアップ');
  console.log('- 特典・リワードシステム');
});