#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🚀 学習Webアプリケーションを起動しています...');

const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// In-memory storage for the web app
const webAppStorage = {
  users: new Map(),
  questions: new Map(),
  answers: new Map(),
  rewards: new Map(),
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
      currentRank: 'bronze',
      rank: '初心者',
      rewards: [],
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
    if (updated.totalScore >= 100) {
      updated.rank = '達人';
      updated.currentRank = 'diamond';
    } else if (updated.totalScore >= 50) {
      updated.rank = '上級者';
      updated.currentRank = 'gold';
    } else if (updated.totalScore >= 25) {
      updated.rank = '中級者';
      updated.currentRank = 'silver';
    } else if (updated.totalScore >= 5) {
      updated.rank = '初心者';
      updated.currentRank = 'bronze';
    }
    
    this.users.set(id, updated);
    return updated;
  },
  
  getAllRewards() {
    return Array.from(this.rewards.values());
  }
};

// Initialize storage
webAppStorage.init();

// Helper functions
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return contentTypes[ext] || 'text/plain';
}

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const { method, url: reqUrl } = req;
  const parsedUrl = url.parse(reqUrl, true);
  const { pathname, query } = parsedUrl;

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/health') {
    sendJSON(res, { 
      status: 'OK', 
      message: '学習Webアプリが正常に動作しています',
      timestamp: new Date().toISOString(),
      users: webAppStorage.users.size,
      questions: webAppStorage.questions.size
    });
    return;
  }

  if (pathname === '/api/users' && method === 'POST') {
    parseBody(req, (error, userData) => {
      if (error) {
        sendJSON(res, { error: 'Invalid JSON' }, 400);
        return;
      }
      try {
        const user = webAppStorage.createUser(userData);
        console.log(`✅ 新しいユーザーが作成されました: ${user.name} (ID: ${user.id})`);
        sendJSON(res, user);
      } catch (error) {
        console.error('❌ ユーザー作成エラー:', error);
        sendJSON(res, { error: error.message }, 500);
      }
    });
    return;
  }

  if (pathname.startsWith('/api/users/') && method === 'GET') {
    const userId = pathname.split('/api/users/')[1];
    try {
      const user = webAppStorage.getUserById(userId);
      if (!user) {
        sendJSON(res, { error: 'ユーザーが見つかりません' }, 404);
        return;
      }
      sendJSON(res, user);
    } catch (error) {
      console.error('❌ ユーザー取得エラー:', error);
      sendJSON(res, { error: error.message }, 500);
    }
    return;
  }

  if (pathname.startsWith('/api/users/') && method === 'PUT') {
    const userId = pathname.split('/api/users/')[1];
    parseBody(req, (error, updates) => {
      if (error) {
        sendJSON(res, { error: 'Invalid JSON' }, 400);
        return;
      }
      try {
        const user = webAppStorage.updateUser(userId, updates);
        if (!user) {
          sendJSON(res, { error: 'ユーザーが見つかりません' }, 404);
          return;
        }
        console.log(`✅ ユーザーが更新されました: ${user.name} (スコア: ${user.totalScore})`);
        sendJSON(res, user);
      } catch (error) {
        console.error('❌ ユーザー更新エラー:', error);
        sendJSON(res, { error: error.message }, 500);
      }
    });
    return;
  }

  if (pathname === '/api/questions/generate' && method === 'POST') {
    parseBody(req, async (error, requestData) => {
      if (error) {
        sendJSON(res, { error: 'Invalid JSON' }, 400);
        return;
      }
      
      try {
        const { type, difficulty } = requestData;
        
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
          sendJSON(res, { error: '無効な問題タイプです' }, 400);
          return;
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
        sendJSON(res, questionData);
      } catch (error) {
        console.error('❌ 問題生成エラー:', error);
        sendJSON(res, { 
          error: '問題の生成に失敗しました',
          details: error.message 
        }, 500);
      }
    });
    return;
  }

  if (pathname === '/api/answers' && method === 'POST') {
    parseBody(req, (error, answerData) => {
      if (error) {
        sendJSON(res, { error: 'Invalid JSON' }, 400);
        return;
      }
      
      try {
        const { questionId, userId, userAnswer } = answerData;
        
        // Get question and user data
        const question = webAppStorage.questions.get(questionId);
        const user = webAppStorage.users.get(userId);
        
        if (!question || !user) {
          sendJSON(res, { error: '問題またはユーザーが見つかりません' }, 404);
          return;
        }
        
        // Check if answer is correct
        const isCorrect = userAnswer.toString().trim() === question.answer.toString().trim();
        
        // Create answer record
        const answerId = `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const answer = {
          id: answerId,
          questionId,
          userId,
          userAnswer,
          isCorrect,
          answeredAt: new Date().toISOString()
        };
        
        webAppStorage.answers.set(answerId, answer);
        
        // Update user score if correct
        let scoreIncrement = 0;
        let rankUp = false;
        let newRewards = [];
        
        if (isCorrect) {
          scoreIncrement = parseInt(question.difficulty) || 1;
          
          // Update scores
          if (question.type === 'math') {
            user.mathScore += scoreIncrement;
          } else if (question.type === 'language') {
            user.languageScore += scoreIncrement;
          }
          user.totalScore += scoreIncrement;
          
          // Check for rank up
          const oldRank = user.rank;
          if (user.totalScore >= 50) {
            user.rank = '達人';
            user.currentRank = 'diamond';
          } else if (user.totalScore >= 25) {
            user.rank = '上級者';
            user.currentRank = 'gold';
          } else if (user.totalScore >= 10) {
            user.rank = '中級者';
            user.currentRank = 'silver';
          } else {
            user.rank = '初心者';
            user.currentRank = 'bronze';
          }
          
          rankUp = oldRank !== user.rank;
          
          // Check for new rewards
          const allRewards = webAppStorage.getAllRewards();
          const earnedRewards = allRewards.filter(reward => 
            user.totalScore >= reward.requiredScore && 
            !user.rewards.includes(reward.id)
          );
          
          earnedRewards.forEach(reward => {
            user.rewards.push(reward.id);
            newRewards.push(reward);
          });
          
          webAppStorage.users.set(userId, user);
        }
        
        console.log(`✅ 回答が記録されました: ${userAnswer} (正解: ${isCorrect})`);
        if (isCorrect) {
          console.log(`🎉 ${user.name}さんのスコア: ${user.totalScore} (+${scoreIncrement})`);
        }
        
        sendJSON(res, {
          answer,
          isCorrect,
          scoreIncrement,
          rankUp,
          newRewards,
          user
        });
      } catch (error) {
        console.error('❌ 回答記録エラー:', error);
        sendJSON(res, { error: error.message }, 500);
      }
    });
    return;
  }

  if (pathname === '/api/rewards' && method === 'GET') {
    try {
      const rewards = webAppStorage.getAllRewards();
      sendJSON(res, rewards);
    } catch (error) {
      console.error('❌ 特典取得エラー:', error);
      sendJSON(res, { error: error.message }, 500);
    }
    return;
  }

  if (pathname.startsWith('/api/users/') && pathname.endsWith('/rewards') && method === 'GET') {
    const userId = pathname.split('/api/users/')[1].split('/rewards')[0];
    try {
      const user = webAppStorage.getUserById(userId);
      if (!user) {
        sendJSON(res, { error: 'ユーザーが見つかりません' }, 404);
        return;
      }
      
      const allRewards = webAppStorage.getAllRewards();
      const earnedRewards = allRewards.filter(reward => user.totalScore >= reward.requiredScore);
      
      sendJSON(res, earnedRewards);
    } catch (error) {
      console.error('❌ ユーザー特典取得エラー:', error);
      sendJSON(res, { error: error.message }, 500);
    }
    return;
  }

  // Serve static files
  if (pathname.startsWith('/assets/')) {
    const filePath = path.join(__dirname, 'client/dist', pathname);
    const contentType = getContentType(filePath);
    sendFile(res, filePath, contentType);
    return;
  }

  // Serve React app for all other routes
  const indexPath = path.join(__dirname, 'client/dist', 'index.html');
  sendFile(res, indexPath, 'text/html');
});

// Start the web application server
server.listen(PORT, '0.0.0.0', () => {
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