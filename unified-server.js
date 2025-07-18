const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
  },
};

// Initialize storage
storage.init();

// Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

// Routes
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { type, difficulty } = req.body;
    
    if (!type || !difficulty) {
      return res.status(400).json({ error: 'Type and difficulty are required' });
    }

    let prompt = '';
    
    if (type === QUESTION_TYPE.MATH) {
      prompt = `
難易度${difficulty}の算数問題を1問作成してください。
以下の形式でJSON形式で回答してください：
{
  "question": "問題文",
  "answer": "正解（数字のみ）"
}

難易度の目安：
1: 一桁の足し算・引き算
2: 二桁の足し算・引き算
3: 簡単な掛け算・割り算
4: 分数・小数の計算
5: 複雑な計算問題

問題文は日本語で、答えは数字のみで返してください。
`;
    } else if (type === QUESTION_TYPE.LANGUAGE) {
      prompt = `
難易度${difficulty}の国語問題を1問作成してください。
以下の形式でJSON形式で回答してください：
{
  "question": "問題文",
  "answer": "正解",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"]
}

難易度の目安：
1: ひらがな・カタカナの読み
2: 漢字の読み（小学校低学年）
3: 語彙・慣用句（小学校中学年）
4: 文法・敬語（小学校高学年）
5: 複雑な文章理解

問題文と選択肢は日本語で、正解は選択肢の中から選んでください。
`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONを抽出して解析
    const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const aiResponse = JSON.parse(jsonMatch[0]);
    
    const questionData = {
      type,
      question: aiResponse.question,
      answer: aiResponse.answer,
      choices: aiResponse.choices || undefined,
      difficulty: parseInt(difficulty),
    };

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
    
    const answerData = {
      userId,
      questionId,
      userAnswer: userAnswer.toString(),
      isCorrect,
    };

    const answer = storage.createAnswer(answerData);

    // Update user score if correct
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

      res.json({ 
        answer, 
        user: updatedUser, 
        scoreIncrement, 
        rankUp: newRank !== user.currentRank,
        newRewards: newRewards.length > 0 ? allRewards.filter(r => newRewards.includes(r.id)) : []
      });
    } else {
      res.json({ answer, user, scoreIncrement: 0, rankUp: false, newRewards: [] });
    }
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

// Serve static files if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 学習アプリが起動しました！`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});