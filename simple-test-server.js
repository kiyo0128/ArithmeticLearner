const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method === 'POST' && req.url === '/api/generate-question') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { type } = JSON.parse(body);
                const response = {
                    id: `test_${Date.now()}`,
                    type: type,
                    question: type === 'math' ? '1 + 1 = ?' : '「いぬ」をカタカナで？',
                    answer: type === 'math' ? '2' : 'イヌ',
                    options: type === 'language' ? ['イヌ', 'イノ', 'ウニ', 'ヌイ', 'ニウ'] : undefined,
                    explanation: type === 'math' ? '1と1を足すと2です' : 'いぬはイヌです',
                    difficulty: 1
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error: ' + error.message }));
            }
        });
        return;
    }
    
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Test Server Running</h1><p>API endpoint: /api/generate-question</p>');
        return;
    }
    
    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});

// Keep process alive
setInterval(() => {
    console.log('Server alive at', new Date().toISOString());
}, 30000);