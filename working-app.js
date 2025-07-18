#!/usr/bin/env node

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');

// Simple in-memory storage
let users = new Map();
let questions = new Map();
let answers = new Map();
let rewards = new Map();
let idCounter = 1;

// Initialize default rewards
const defaultRewards = [
  { id: 'reward_1', name: 'はじめの一歩', description: '最初の正解！', requiredScore: 1, icon: '🎉' },
  { id: 'reward_2', name: '学習の星', description: '5問正解', requiredScore: 5, icon: '⭐' },
  { id: 'reward_3', name: '努力の証', description: '10問正解', requiredScore: 10, icon: '🏆' },
  { id: 'reward_4', name: '知識の宝庫', description: '25問正解', requiredScore: 25, icon: '📚' },
  { id: 'reward_5', name: '学習マスター', description: '50問正解', requiredScore: 50, icon: '👑' },
];

defaultRewards.forEach(reward => {
  rewards.set(reward.id, reward);
});

// Constants
const QUESTION_TYPE = { MATH: 'math', LANGUAGE: 'language' };
const RANK = { BRONZE: 'bronze', SILVER: 'silver', GOLD: 'gold', PLATINUM: 'platinum', DIAMOND: 'diamond' };
const RANK_REQUIREMENTS = { bronze: 0, silver: 10, gold: 25, platinum: 50, diamond: 100 };

function getRankPriority(rank) {
  const priorities = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
  return priorities[rank] || 0;
}

function generateId() {
  return `id_${idCounter++}`;
}

// Helper functions
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  if (fs.existsSync(filePath)) {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health') {
    sendJSON(res, { status: 'OK', timestamp: new Date().toISOString() });
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let data = {};
      if (body) {
        try {
          data = JSON.parse(body);
        } catch (e) {
          sendJSON(res, { error: 'Invalid JSON' }, 400);
          return;
        }
      }

      // Create user
      if (pathname === '/api/users' && method === 'POST') {
        const userData = {
          id: generateId(),
          name: data.name,
          totalScore: 0,
          mathScore: 0,
          languageScore: 0,
          currentRank: RANK.BRONZE,
          rewards: [],
          createdAt: new Date().toISOString(),
        };
        
        users.set(userData.id, userData);
        sendJSON(res, userData);
        return;
      }

      // Get user
      if (pathname.startsWith('/api/users/') && method === 'GET') {
        const userId = pathname.split('/')[3];
        const user = users.get(userId);
        if (!user) {
          sendJSON(res, { error: 'User not found' }, 404);
          return;
        }
        sendJSON(res, user);
        return;
      }

      // Generate question
      if (pathname === '/api/questions/generate' && method === 'POST') {
        const { type, difficulty } = data;
        
        let questionData;
        
        if (type === QUESTION_TYPE.MATH) {
          const num1 = Math.floor(Math.random() * (difficulty * 10)) + 1;
          const num2 = Math.floor(Math.random() * (difficulty * 5)) + 1;
          const operations = ['+', '-', '*'];
          const operation = operations[Math.floor(Math.random() * operations.length)];
          
          let answer;
          let question;
          
          if (operation === '+') {
            answer = num1 + num2;
            question = `${num1} + ${num2} = ?`;
          } else if (operation === '-') {
            answer = num1;
            question = `${num1 + num2} - ${num2} = ?`;
          } else {
            answer = num1 * num2;
            question = `${num1} × ${num2} = ?`;
          }
          
          questionData = {
            id: generateId(),
            type,
            question,
            answer: answer.toString(),
            difficulty: parseInt(difficulty),
            createdAt: new Date().toISOString(),
          };
        } else {
          const sampleQuestions = [
            {
              question: '次の漢字の読み方として正しいものはどれですか？「学習」',
              answer: 'がくしゅう',
              choices: ['がくしゅう', 'がくしゅ', 'がくしゅうう', 'がくしゅー', 'がくしゅい'],
            },
            {
              question: '次の慣用句の意味として正しいものはどれですか？「頭を下げる」',
              answer: '謝る',
              choices: ['謝る', '考える', '眠る', '病気になる', '髪を切る'],
            },
            {
              question: '次の敬語として正しいものはどれですか？「先生が___」',
              answer: 'いらっしゃる',
              choices: ['いらっしゃる', 'いる', 'おる', 'ある', 'いらっしゃい'],
            },
          ];
          
          const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
          questionData = {
            id: generateId(),
            type,
            ...randomQuestion,
            difficulty: parseInt(difficulty),
            createdAt: new Date().toISOString(),
          };
        }
        
        questions.set(questionData.id, questionData);
        sendJSON(res, questionData);
        return;
      }

      // Submit answer
      if (pathname === '/api/answers' && method === 'POST') {
        const { userId, questionId, userAnswer } = data;
        
        const question = questions.get(questionId);
        const user = users.get(userId);
        
        if (!question || !user) {
          sendJSON(res, { error: 'Question or user not found' }, 404);
          return;
        }
        
        const isCorrect = userAnswer.toString().trim() === question.answer.toString().trim();
        
        const answer = {
          id: generateId(),
          userId,
          questionId,
          userAnswer: userAnswer.toString(),
          isCorrect,
          answeredAt: new Date().toISOString(),
        };
        
        answers.set(answer.id, answer);
        
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
          const allRewards = Array.from(rewards.values());
          const newRewards = allRewards.filter(reward => 
            newTotalScore >= reward.requiredScore && 
            !user.rewards.includes(reward.id)
          ).map(reward => reward.id);
          
          const updatedUser = {
            ...user,
            totalScore: newTotalScore,
            mathScore: newMathScore,
            languageScore: newLanguageScore,
            currentRank: newRank,
            rewards: [...user.rewards, ...newRewards],
          };
          
          users.set(userId, updatedUser);
          
          result = {
            answer,
            user: updatedUser,
            scoreIncrement,
            rankUp: newRank !== user.currentRank,
            newRewards: newRewards.length > 0 ? allRewards.filter(r => newRewards.includes(r.id)) : []
          };
        }
        
        sendJSON(res, result);
        return;
      }

      // Get rewards
      if (pathname === '/api/rewards' && method === 'GET') {
        const allRewards = Array.from(rewards.values());
        sendJSON(res, allRewards);
        return;
      }

      // Default API response
      sendJSON(res, { error: 'Not found' }, 404);
    });

    return;
  }

  // Serve static files
  if (method === 'GET') {
    let filePath;
    
    if (pathname === '/') {
      filePath = path.join(__dirname, 'client', 'dist', 'index.html');
    } else {
      filePath = path.join(__dirname, 'client', 'dist', pathname);
    }
    
    // Check if file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      sendFile(res, filePath, getContentType(filePath));
      return;
    }
    
    // Fallback to index.html for SPA routes
    const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      sendFile(res, indexPath, 'text/html');
      return;
    }
    
    // No frontend build found
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>学習アプリ</title></head>
        <body>
          <h1>学習アプリケーション</h1>
          <p>フロントエンドがビルドされていません。</p>
          <p>ビルドコマンド: <code>cd client && npx vite build</code></p>
          <p>API は <a href="/health">こちら</a> で確認できます。</p>
        </body>
      </html>
    `);
    return;
  }

  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 学習アプリケーションサーバーが起動しました！`);
  console.log(`🌐 アクセスURL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📚 算数・国語問題アプリが利用可能です！`);
  console.log(`\n機能一覧:`);
  console.log(`- AI生成問題（算数・国語）`);
  console.log(`- テンキー入力システム`);
  console.log(`- 5択選択システム`);
  console.log(`- スコア管理とランクアップ`);
  console.log(`- 特典・リワードシステム`);
});