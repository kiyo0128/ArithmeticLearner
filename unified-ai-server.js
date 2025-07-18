const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle AI question generation
  if (req.method === 'POST' && req.url === '/api/generate-question') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { type, difficulty } = JSON.parse(body);
          
          if (!type || !difficulty) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Type and difficulty are required' }));
            return;
          }

          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

          if (type === 'math') {
            const prompt = `小学1年生（6-7歳）向けの算数問題を生成してください。

**学習指導要領に基づく内容:**
- 数と計算：1から10までの数の理解
- 足し算：1桁+1桁（答えが10以下）
- 引き算：1桁-1桁（答えが0以上）
- 数の大小比較
- 具体物を使った数え方
- 10の合成と分解

**問題の条件:**
- 数字は1-10の範囲内のみ使用
- 足し算の答えは10以下
- 引き算の答えは0以上
- 文章問題は身近な物（りんご、えんぴつ、本など）を使用
- 説明は1年生でも理解できる優しい言葉で

**問題パターン例:**
- 「3 + 2 = ?」
- 「7 - 3 = ?」
- 「りんごが5こあります。全部で何こですか？」
- 「4と何を足すと10になりますか？」
- 「6と3では、どちらが大きいですか？」

以下のJSON形式で回答してください：
{
  "question": "問題文",
  "answer": "答え（数字のみ）",
  "explanation": "1年生向けの優しい解説"
}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // JSONを抽出
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('Invalid JSON response');
            }
            
            const questionData = JSON.parse(jsonMatch[0]);
            
            const responseData = {
              id: `math_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
              type: 'math',
              question: questionData.question,
              answer: questionData.answer,
              explanation: questionData.explanation,
              difficulty: difficulty
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseData));
            
          } else if (type === 'language') {
            const prompt = `小学1年生（6-7歳）向けの国語問題を生成してください。

**学習指導要領に基づく内容:**
- ひらがな46文字の読み書き
- カタカナ46文字の読み書き
- 基本的な語彙（身近な物の名前）
- 反対語（大きい⇔小さい など）
- 文字数を数える
- 音の識別（最初の音、同じ音など）

**問題の条件:**
- 漢字は一切使用しない（ひらがな・カタカナのみ）
- 身近な物の名前を使用（動物、食べ物、学用品など）
- 1年生でも理解できる優しい言葉で出題
- 選択肢は5個

**問題パターン例:**
- 「『おおきい』の反対の言葉はどれですか？」
- 「『いぬ』をカタカナで書くとどれですか？」
- 「『ありがとう』は何文字ですか？」
- 「『か』で始まる言葉はどれですか？」

以下のJSON形式で回答してください：
{
  "question": "問題文",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"],
  "correctAnswer": "正解の選択肢",
  "explanation": "1年生向けの優しい解説"
}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // JSONを抽出
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('Invalid JSON response');
            }
            
            const questionData = JSON.parse(jsonMatch[0]);
            
            const responseData = {
              id: `lang_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
              type: 'language',
              question: questionData.question,
              options: questionData.choices,
              answer: questionData.correctAnswer,
              explanation: questionData.explanation,
              difficulty: difficulty
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseData));
            
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
    } catch (error) {
      console.error('Error handling request:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  // Serve static files
  if (req.method === 'GET') {
    let filePath = path.join(__dirname, 'client/dist', req.url === '/' ? 'index.html' : req.url);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (ext) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.ico': contentType = 'image/x-icon'; break;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    }
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1>');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`統合AIサーバーがポート ${PORT} で起動しました`);
  console.log(`アクセス: http://localhost:${PORT}`);
});