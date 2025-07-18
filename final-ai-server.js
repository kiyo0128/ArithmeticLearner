const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple AI question generation (mock for now to get it working)
function generateMathQuestion() {
    const questions = [
        { question: "3 + 4 = ?", answer: "7", explanation: "3と4を足すと7になります" },
        { question: "5 + 2 = ?", answer: "7", explanation: "5と2を足すと7になります" },
        { question: "6 + 1 = ?", answer: "7", explanation: "6と1を足すと7になります" },
        { question: "2 + 3 = ?", answer: "5", explanation: "2と3を足すと5になります" },
        { question: "4 + 4 = ?", answer: "8", explanation: "4と4を足すと8になります" },
        { question: "1 + 1 = ?", answer: "2", explanation: "1と1を足すと2になります" },
        { question: "7 - 2 = ?", answer: "5", explanation: "7から2を引くと5になります" },
        { question: "9 - 3 = ?", answer: "6", explanation: "9から3を引くと6になります" },
        { question: "8 - 1 = ?", answer: "7", explanation: "8から1を引くと7になります" },
        { question: "10 - 4 = ?", answer: "6", explanation: "10から4を引くと6になります" }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return {
        id: `math_${Date.now()}`,
        type: 'math',
        question: randomQuestion.question,
        answer: randomQuestion.answer,
        explanation: randomQuestion.explanation,
        difficulty: 1
    };
}

function generateLanguageQuestion() {
    const questions = [
        {
            question: "「いぬ」をカタカナで書くと？",
            choices: ["イヌ", "イノ", "ウニ", "ヌイ", "ニウ"],
            correctAnswer: "イヌ",
            explanation: "いぬはカタカナでイヌと書きます"
        },
        {
            question: "「ねこ」をカタカナで書くと？",
            choices: ["ネコ", "ネカ", "コネ", "ケノ", "ノケ"],
            correctAnswer: "ネコ",
            explanation: "ねこはカタカナでネコと書きます"
        },
        {
            question: "「うさぎ」をカタカナで書くと？",
            choices: ["ウサギ", "ウシギ", "サウギ", "ギウサ", "ウギサ"],
            correctAnswer: "ウサギ",
            explanation: "うさぎはカタカナでウサギと書きます"
        },
        {
            question: "「でんしゃ」をカタカナで書くと？",
            choices: ["デンシャ", "デンサ", "シャデン", "テンシャ", "デシャン"],
            correctAnswer: "デンシャ",
            explanation: "でんしゃはカタカナでデンシャと書きます"
        },
        {
            question: "「かばん」をカタカナで書くと？",
            choices: ["カバン", "カバ", "バンカ", "ガバン", "カパン"],
            correctAnswer: "カバン",
            explanation: "かばんはカタカナでカバンと書きます"
        }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return {
        id: `lang_${Date.now()}`,
        type: 'language',
        question: randomQuestion.question,
        options: randomQuestion.choices,
        answer: randomQuestion.correctAnswer,
        explanation: randomQuestion.explanation,
        difficulty: 1
    };
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle question generation
    if (req.method === 'POST' && req.url === '/api/generate-question') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { type, difficulty } = JSON.parse(body);
                console.log('Generating question for type:', type);
                
                let question;
                if (type === 'math') {
                    question = generateMathQuestion();
                } else if (type === 'language') {
                    question = generateLanguageQuestion();
                } else {
                    throw new Error('Invalid question type');
                }
                
                console.log('Generated question:', question);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(question));
            } catch (error) {
                console.error('Error generating question:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to generate question' }));
            }
        });
        return;
    }

    // Serve static files
    if (req.method === 'GET') {
        let filePath = req.url === '/' ? 'client/dist/index.html' : `client/dist${req.url}`;
        filePath = path.join(__dirname, filePath);
        
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);
            let contentType = 'text/html';
            
            if (ext === '.js') contentType = 'text/javascript';
            else if (ext === '.css') contentType = 'text/css';
            
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`AI学習アプリがポート${PORT}で起動しました`);
    console.log(`アクセス: http://localhost:${PORT}`);
    console.log('問題生成エンジン: シンプル版（AIは後で統合）');
});