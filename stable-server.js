const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('Starting stable server...');

// Math questions for 1st grade
const mathQuestions = [
    { question: "1 + 1 = ?", answer: "2", explanation: "1と1を足すと2になります" },
    { question: "2 + 1 = ?", answer: "3", explanation: "2と1を足すと3になります" },
    { question: "3 + 2 = ?", answer: "5", explanation: "3と2を足すと5になります" },
    { question: "4 + 3 = ?", answer: "7", explanation: "4と3を足すと7になります" },
    { question: "5 + 2 = ?", answer: "7", explanation: "5と2を足すと7になります" },
    { question: "6 + 1 = ?", answer: "7", explanation: "6と1を足すと7になります" },
    { question: "8 - 3 = ?", answer: "5", explanation: "8から3を引くと5になります" },
    { question: "9 - 4 = ?", answer: "5", explanation: "9から4を引くと5になります" },
    { question: "10 - 5 = ?", answer: "5", explanation: "10から5を引くと5になります" },
    { question: "7 - 2 = ?", answer: "5", explanation: "7から2を引くと5になります" }
];

// Language questions for 1st grade
const languageQuestions = [
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
    },
    {
        question: "「りんご」をカタカナで書くと？",
        choices: ["リンゴ", "リンガ", "ゴリン", "ゴンリ", "ンリゴ"],
        correctAnswer: "リンゴ",
        explanation: "りんごはカタカナでリンゴと書きます"
    }
];

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    console.log(`Request: ${req.method} ${req.url}`);
    
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
                const requestData = JSON.parse(body);
                const { type, difficulty } = requestData;
                
                console.log(`Generating ${type} question with difficulty ${difficulty}`);
                
                let question;
                if (type === 'math') {
                    const randomQuestion = mathQuestions[Math.floor(Math.random() * mathQuestions.length)];
                    question = {
                        id: `math_${Date.now()}`,
                        type: 'math',
                        question: randomQuestion.question,
                        answer: randomQuestion.answer,
                        explanation: randomQuestion.explanation,
                        difficulty: difficulty || 1
                    };
                } else if (type === 'language') {
                    const randomQuestion = languageQuestions[Math.floor(Math.random() * languageQuestions.length)];
                    question = {
                        id: `lang_${Date.now()}`,
                        type: 'language',
                        question: randomQuestion.question,
                        options: randomQuestion.choices,
                        answer: randomQuestion.correctAnswer,
                        explanation: randomQuestion.explanation,
                        difficulty: difficulty || 1
                    };
                } else {
                    throw new Error('Invalid question type');
                }
                
                console.log('Generated question:', question);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(question));
            } catch (error) {
                console.error('Error generating question:', error);
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
                
                switch(ext) {
                    case '.js': contentType = 'text/javascript'; break;
                    case '.css': contentType = 'text/css'; break;
                    case '.json': contentType = 'application/json'; break;
                    case '.png': contentType = 'image/png'; break;
                    case '.jpg': contentType = 'image/jpeg'; break;
                    case '.jpeg': contentType = 'image/jpeg'; break;
                    case '.gif': contentType = 'image/gif'; break;
                    case '.svg': contentType = 'image/svg+xml'; break;
                    default: contentType = 'text/html';
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(filePath).pipe(res);
            } else {
                console.log(`File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        } catch (error) {
            console.error('Error serving file:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
        }
        return;
    }

    // Default response
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

const PORT = process.env.PORT || 3000;

server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Trying to kill existing process...`);
        process.exit(1);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ AI学習アプリがポート${PORT}で起動しました`);
    console.log(`✓ アクセス: http://localhost:${PORT}`);
    console.log(`✓ 問題生成エンジン: 安定版`);
    console.log(`✓ 算数問題: ${mathQuestions.length}種類`);
    console.log(`✓ 国語問題: ${languageQuestions.length}種類`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});