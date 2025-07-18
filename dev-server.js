#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for development
const storage = {
  users: new Map(),
  questions: new Map(),
  answers: new Map(),
  rewards: new Map(),
  nextId: 1,
  
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
  },
};

// Initialize default rewards
const initializeRewards = () => {
  const defaultRewards = [
    { id: 'reward_1', name: 'はじめの一歩', description: '最初の正解！', requiredScore: 1, icon: '🎉' },
    { id: 'reward_2', name: '学習の星', description: '5問正解', requiredScore: 5, icon: '⭐' },
    { id: 'reward_3', name: '努力の証', description: '10問正解', requiredScore: 10, icon: '🏆' },
    { id: 'reward_4', name: '知識の宝庫', description: '25問正解', requiredScore: 25, icon: '📚' },
    { id: 'reward_5', name: '学習マスター', description: '50問正解', requiredScore: 50, icon: '👑' },
  ];
  
  defaultRewards.forEach(reward => {
    storage.rewards.set(reward.id, reward);
  });
};

initializeRewards();

// Constants
const QUESTION_TYPE = {
  MATH: 'math',
  LANGUAGE: 'language',
};

const RANK = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
};

const RANK_REQUIREMENTS = {
  [RANK.BRONZE]: 0,
  [RANK.SILVER]: 10,
  [RANK.GOLD]: 25,
  [RANK.PLATINUM]: 50,
  [RANK.DIAMOND]: 100,
};

function getRankPriority(rank) {
  const priorities = {
    [RANK.BRONZE]: 1,
    [RANK.SILVER]: 2,
    [RANK.GOLD]: 3,
    [RANK.PLATINUM]: 4,
    [RANK.DIAMOND]: 5,
  };
  return priorities[rank] || 0;
}

// API Routes
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { type, difficulty } = req.body;
    
    if (!type || !difficulty) {
      return res.status(400).json({ error: 'Type and difficulty are required' });
    }

    // Generate sample questions for development
    let questionData;
    
    if (type === QUESTION_TYPE.MATH) {
      const operations = ['+', '-', '*'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const num1 = Math.floor(Math.random() * (difficulty * 10)) + 1;
      const num2 = Math.floor(Math.random() * (difficulty * 5)) + 1;
      
      let answer;
      let question;
      
      switch (operation) {
        case '+':
          answer = num1 + num2;
          question = `${num1} + ${num2} = ?`;
          break;
        case '-':
          answer = num1 + num2;
          question = `${answer} - ${num2} = ?`;
          answer = num1;
          break;
        case '*':
          answer = num1 * num2;
          question = `${num1} × ${num2} = ?`;
          break;
      }
      
      questionData = {
        type,
        question,
        answer: answer.toString(),
        difficulty: parseInt(difficulty),
      };
    } else {
      const questions = [
        {
          question: '次の漢字の読み方として正しいものはどれですか？「学習」',
          answer: 'がくしゅう',
          choices: ['がくしゅう', 'がくしゅ', 'がくしゅうう', 'がくしゅー', 'がくしゅい'],
        },
        {
          question: '次の文章で正しい敬語はどれですか？「先生が___」',
          answer: 'いらっしゃる',
          choices: ['いらっしゃる', 'いる', 'おる', 'ある', 'いらっしゃい'],
        },
        {
          question: '次の慣用句の意味として正しいものはどれですか？「頭を下げる」',
          answer: '謝る',
          choices: ['謝る', '考える', '眠る', '病気になる', '髪を切る'],
        },
      ];
      
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      questionData = {
        type,
        ...randomQuestion,
        difficulty: parseInt(difficulty),
      };
    }

    const question = storage.createQuestion(questionData);
    res.json(question);
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      totalScore: 0,
      mathScore: 0,
      languageScore: 0,
      currentRank: RANK.BRONZE,
      rewards: [],
    };
    
    const user = storage.createUser(userData);
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = storage.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.post('/api/answers', async (req, res) => {
  try {
    const { userId, questionId, userAnswer } = req.body;
    
    if (!userId || !questionId || userAnswer === undefined) {
      return res.status(400).json({ error: 'UserId, questionId, and userAnswer are required' });
    }

    const question = storage.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const user = storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCorrect = userAnswer.toString().trim() === question.answer.toString().trim();
    
    const answer = storage.createAnswer({
      userId,
      questionId,
      userAnswer: userAnswer.toString(),
      isCorrect,
    });

    let result = { answer, user, scoreIncrement: 0, rankUp: false, newRewards: [] };

    if (isCorrect) {
      const scoreIncrement = question.difficulty;
      const newTotalScore = user.totalScore + scoreIncrement;
      const newMathScore = question.type === QUESTION_TYPE.MATH ? user.mathScore + scoreIncrement : user.mathScore;
      const newLanguageScore = question.type === QUESTION_TYPE.LANGUAGE ? user.languageScore + scoreIncrement : user.languageScore;
      
      // Check for rank up
      let newRank = user.currentRank;
      for (const [rank, requirement] of Object.entries(RANK_REQUIREMENTS)) {
        if (newTotalScore >= requirement && getRankPriority(rank) > getRankPriority(newRank)) {
          newRank = rank;
        }
      }

      // Check for new rewards
      const allRewards = storage.getAllRewards();
      const newRewards = allRewards.filter(reward => 
        newTotalScore >= reward.requiredScore && 
        !user.rewards.includes(reward.id)
      ).map(reward => reward.id);

      const updatedUser = storage.updateUser(userId, {
        totalScore: newTotalScore,
        mathScore: newMathScore,
        languageScore: newLanguageScore,
        currentRank: newRank,
        rewards: [...user.rewards, ...newRewards],
      });

      result = {
        answer,
        user: updatedUser,
        scoreIncrement,
        rankUp: newRank !== user.currentRank,
        newRewards: newRewards.length > 0 ? allRewards.filter(r => newRewards.includes(r.id)) : []
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

app.get('/api/rewards', async (req, res) => {
  try {
    const rewards = storage.getAllRewards();
    res.json(rewards);
  } catch (error) {
    console.error('Error getting rewards:', error);
    res.status(500).json({ error: 'Failed to get rewards' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// In development, also start the Vite dev server
let viteProcess;
if (process.env.NODE_ENV !== 'production') {
  console.log('Starting Vite development server...');
  viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '8080'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit'
  });
  
  viteProcess.on('error', (error) => {
    console.error('Vite server error:', error);
  });
}

// Start the backend server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📚 学習アプリ - バックエンドAPI起動完了！`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌐 フロントエンド: http://localhost:8080`);
    console.log(`📖 開発環境で両方のサーバーが起動しています`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  if (viteProcess) {
    viteProcess.kill();
  }
  process.exit(0);
});