const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const server = http.createServer(async (req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle AI question generation
  if (req.method === 'POST' && req.url === '/api/generate-question') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { type, difficulty } = JSON.parse(body);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        if (type === 'math') {
          const prompt = `小学1年生向けの算数問題を1つ生成してください。足し算で答えが10以下。JSON形式で{"question": "問題文", "answer": "答え", "explanation": "解説"}`;
          
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              id: `math_${Date.now()}`,
              type: 'math',
              question: data.question,
              answer: data.answer,
              explanation: data.explanation,
              difficulty: difficulty
            }));
          } else {
            throw new Error('Failed to parse AI response');
          }
        } else if (type === 'language') {
          const prompt = `小学1年生向けの国語問題を1つ生成してください。ひらがな・カタカナのみ。JSON形式で{"question": "問題文", "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"], "correctAnswer": "正解", "explanation": "解説"}`;
          
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              id: `lang_${Date.now()}`,
              type: 'language',
              question: data.question,
              options: data.choices,
              answer: data.correctAnswer,
              explanation: data.explanation,
              difficulty: difficulty
            }));
          } else {
            throw new Error('Failed to parse AI response');
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid question type' }));
        }
      } catch (error) {
        console.error('Error generating question:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to generate question: ' + error.message }));
      }
    });
    return;
  }

  // Serve static files
  if (req.method === 'GET') {
    const filePath = req.url === '/' ? 'client/dist/index.html' : `client/dist${req.url}`;
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(fullPath);
      let contentType = 'text/html';
      
      if (ext === '.js') contentType = 'text/javascript';
      else if (ext === '.css') contentType = 'text/css';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(fullPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000, () => {
  console.log('AI学習アプリがポート3000で起動しました');
  console.log('アクセス: http://localhost:3000');
});