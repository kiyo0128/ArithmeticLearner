const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to generate math questions
async function generateMathQuestion(difficulty = 1) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `小学1年生向けの算数問題を1つ生成してください。
    要求:
    - 1から10までの数字を使用
    - 足し算または引き算
    - 答えは20以下
    - 結果をJSONで返す: {"question": "問題文", "answer": "答え", "explanation": "簡単な解説"}
    
    例: {"question": "3 + 4 = ?", "answer": "7", "explanation": "3と4を足すと7になります"}`;
    
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('Math AI Response:', text);
        
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
                id: `math_${Date.now()}`,
                type: 'math',
                question: data.question,
                answer: data.answer,
                explanation: data.explanation,
                difficulty: difficulty
            };
        }
        throw new Error('Could not parse AI response');
    } catch (error) {
        console.error('Math generation error:', error);
        throw error;
    }
}

// Helper function to generate language questions
async function generateLanguageQuestion(difficulty = 1) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `小学1年生向けの国語問題を1つ生成してください。
    要求:
    - ひらがな・カタカナのみ（漢字は使用しない）
    - 5択選択問題
    - 結果をJSONで返す: {"question": "問題文", "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"], "correctAnswer": "正解", "explanation": "解説"}
    
    例: {"question": "「いぬ」をカタカナで書くと？", "choices": ["イヌ", "イノ", "ウニ", "ヌイ", "ニウ"], "correctAnswer": "イヌ", "explanation": "いぬはカタカナでイヌと書きます"}`;
    
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('Language AI Response:', text);
        
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
                id: `lang_${Date.now()}`,
                type: 'language',
                question: data.question,
                options: data.choices,
                answer: data.correctAnswer,
                explanation: data.explanation,
                difficulty: difficulty
            };
        }
        throw new Error('Could not parse AI response');
    } catch (error) {
        console.error('Language generation error:', error);
        throw error;
    }
}

// Server setup
const server = http.createServer(async (req, res) => {
    // CORS headers
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
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const { type, difficulty } = JSON.parse(body);
                console.log('Generating question:', type, difficulty);
                
                let question;
                if (type === 'math') {
                    question = await generateMathQuestion(difficulty);
                } else if (type === 'language') {
                    question = await generateLanguageQuestion(difficulty);
                } else {
                    throw new Error('Invalid question type');
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(question));
            } catch (error) {
                console.error('Question generation error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Failed to generate question',
                    details: error.message 
                }));
            }
        });
        return;
    }

    // Serve static files
    if (req.method === 'GET') {
        let filePath = req.url === '/' ? 'client/dist/index.html' : `client/dist${req.url}`;
        filePath = path.join(__dirname, filePath);
        
        try {
            if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                let contentType = 'text/html';
                
                if (ext === '.js') contentType = 'text/javascript';
                else if (ext === '.css') contentType = 'text/css';
                else if (ext === '.json') contentType = 'application/json';
                
                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            }
        } catch (error) {
            console.error('Static file error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error');
        }
        return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`AI学習アプリがポート${PORT}で起動しました`);
    console.log(`アクセス: http://localhost:${PORT}`);
    console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Available' : 'Missing');
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});