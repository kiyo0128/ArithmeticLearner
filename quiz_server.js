const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// In-memory storage
const storage = {
    users: new Map(),
    questions: new Map()
};

// Generate random math question
function generateMathQuestion(difficulty = 1) {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    let questionText;
    
    if (operation === '+') {
        answer = num1 + num2;
        questionText = `${num1} + ${num2} = ?`;
    } else {
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        questionText = `${larger} - ${smaller} = ?`;
    }
    
    const question = {
        id: `math_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        type: 'math',
        question: questionText,
        answer: answer.toString(),
        difficulty: difficulty,
        explanation: `計算結果は ${answer} です。`
    };
    
    storage.questions.set(question.id, question);
    return question;
}

// Generate random language question
function generateLanguageQuestion(difficulty = 1) {
    const questions = [
        {
            question: '「早い」の反対語はどれですか？',
            options: ['遅い', '速い', '近い', '遠い', '高い'],
            answer: '遅い',
            explanation: '「早い」の反対語は「遅い」です。'
        },
        {
            question: '「大きい」の反対語はどれですか？',
            options: ['小さい', '長い', '短い', '太い', '細い'],
            answer: '小さい',
            explanation: '「大きい」の反対語は「小さい」です。'
        },
        {
            question: '「暑い」の反対語はどれですか？',
            options: ['寒い', '冷たい', '涼しい', '暖かい', '熱い'],
            answer: '寒い',
            explanation: '「暑い」の反対語は「寒い」です。'
        },
        {
            question: '「重い」の反対語はどれですか？',
            options: ['軽い', '軟らかい', '硬い', '強い', '弱い'],
            answer: '軽い',
            explanation: '「重い」の反対語は「軽い」です。'
        },
        {
            question: '「新しい」の反対語はどれですか？',
            options: ['古い', '若い', '新品', '綺麗', '汚い'],
            answer: '古い',
            explanation: '「新しい」の反対語は「古い」です。'
        }
    ];
    
    const selected = questions[Math.floor(Math.random() * questions.length)];
    const question = {
        id: `lang_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        type: 'language',
        question: selected.question,
        options: selected.options,
        answer: selected.answer,
        difficulty: difficulty,
        explanation: selected.explanation
    };
    
    storage.questions.set(question.id, question);
    return question;
}

// Check if answer is correct
function checkAnswer(question, userAnswer) {
    if (question.type === 'math') {
        return question.answer.toString().trim() === userAnswer.toString().trim();
    } else if (question.type === 'language') {
        return question.answer === userAnswer;
    }
    return false;
}

// Send JSON response
function sendJSON(res, data, statusCode = 200) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

// Send HTML file
function sendHTML(res, filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
    } catch (err) {
        res.writeHead(404, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        res.end('File not found');
    }
}

// Parse request body
function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (err) {
            callback(err, null);
        }
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }
    
    // Handle GET requests
    if (req.method === 'GET') {
        if (pathname === '/api/health') {
            sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
        } else if (pathname === '/api/questions/generate') {
            const type = query.type || 'math';
            const difficulty = parseInt(query.difficulty || '1');
            
            try {
                let question;
                if (type === 'math') {
                    question = generateMathQuestion(difficulty);
                } else if (type === 'language') {
                    question = generateLanguageQuestion(difficulty);
                } else {
                    sendJSON(res, { error: 'Invalid question type' }, 400);
                    return;
                }
                
                console.log(`Generated ${type} question: ${question.question}`);
                sendJSON(res, question);
            } catch (err) {
                console.error('Error generating question:', err);
                sendJSON(res, { error: 'Failed to generate question' }, 500);
            }
        } else if (pathname === '/' || pathname === '/index.html') {
            sendHTML(res, 'client/dist/index.html');
        } else {
            res.writeHead(404, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            });
            res.end('Not found');
        }
    }
    
    // Handle POST requests
    else if (req.method === 'POST') {
        if (pathname === '/api/users') {
            parseBody(req, (err, data) => {
                if (err) {
                    sendJSON(res, { error: 'Invalid JSON' }, 400);
                    return;
                }
                
                if (!data.name) {
                    sendJSON(res, { error: 'Name is required' }, 400);
                    return;
                }
                
                const user = {
                    id: `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    name: data.name,
                    totalScore: 0,
                    mathScore: 0,
                    languageScore: 0,
                    rank: '初心者',
                    currentRank: 'bronze',
                    rewards: [],
                    createdAt: new Date().toISOString()
                };
                
                storage.users.set(user.id, user);
                console.log(`Created user: ${user.name} (${user.id})`);
                sendJSON(res, user);
            });
        } else if (pathname === '/api/answers') {
            parseBody(req, (err, data) => {
                if (err) {
                    sendJSON(res, { error: 'Invalid JSON' }, 400);
                    return;
                }
                
                const { questionId, answer, userId } = data;
                
                if (!questionId || !answer || !userId) {
                    sendJSON(res, { error: 'Missing required fields' }, 400);
                    return;
                }
                
                const question = storage.questions.get(questionId);
                if (!question) {
                    sendJSON(res, { error: 'Question not found' }, 404);
                    return;
                }
                
                const isCorrect = checkAnswer(question, answer);
                const scoreIncrement = isCorrect ? 10 : 0;
                
                // Update user score
                const user = storage.users.get(userId);
                if (user) {
                    user.totalScore += scoreIncrement;
                    if (question.type === 'math') {
                        user.mathScore += scoreIncrement;
                    } else if (question.type === 'language') {
                        user.languageScore += scoreIncrement;
                    }
                    
                    // Update rank
                    if (user.totalScore >= 100) {
                        user.rank = 'エキスパート';
                        user.currentRank = 'gold';
                    } else if (user.totalScore >= 50) {
                        user.rank = '中級者';
                        user.currentRank = 'silver';
                    } else {
                        user.rank = '初心者';
                        user.currentRank = 'bronze';
                    }
                }
                
                const result = {
                    id: `answer_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    questionId: questionId,
                    userId: userId,
                    answer: answer,
                    isCorrect: isCorrect,
                    scoreIncrement: scoreIncrement,
                    answeredAt: new Date().toISOString()
                };
                
                console.log(`Answer submitted: ${answer} -> ${isCorrect ? 'Correct' : 'Wrong'} (+${scoreIncrement})`);
                sendJSON(res, result);
            });
        } else {
            res.writeHead(404, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            });
            res.end('Not found');
        }
    } else {
        res.writeHead(405, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        res.end('Method not allowed');
    }
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 学習アプリケーションを起動しています...');
    console.log('📚 算数・国語問題アプリ');
    console.log('=' * 50);
    console.log('🌐 ========================================');
    console.log('🚀 学習Webアプリケーションが起動しました！');
    console.log('🌐 ========================================');
    console.log(`📱 アクセスURL: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log('🌐 ========================================');
    console.log('🎯 ブラウザでアクセスして学習を開始してください！');
    console.log('========================================');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});