const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Simple storage
const storage = new Map();
let nextId = 1;

function generateId() {
  return `user_${Date.now()}_${nextId++}`;
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  
  console.log(`${method} ${url}`);
  
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }
  
  if (url === '/api/health') {
    sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }
  
  if (url === '/api/users' && method === 'POST') {
    try {
      const data = await parseBody(req);
      
      if (!data.name) {
        sendJSON(res, { error: 'Name is required' }, 400);
        return;
      }
      
      const user = {
        id: generateId(),
        name: data.name,
        totalScore: 0,
        mathScore: 0,
        languageScore: 0,
        rank: '初心者',
        currentRank: 'bronze',
        rewards: [],
        createdAt: new Date().toISOString()
      };
      
      storage.set(user.id, user);
      console.log(`Created user: ${user.name} (${user.id})`);
      sendJSON(res, user);
      return;
    } catch (error) {
      sendJSON(res, { error: 'Invalid request' }, 400);
      return;
    }
  }
  
  if (url.startsWith('/api/users/') && method === 'GET') {
    const userId = url.split('/api/users/')[1];
    const user = storage.get(userId);
    
    if (!user) {
      sendJSON(res, { error: 'User not found' }, 404);
      return;
    }
    
    sendJSON(res, user);
    return;
  }
  
  // Serve static files
  if (url === '/' || url === '/index.html') {
    try {
      const indexPath = path.join(__dirname, 'client/dist/index.html');
      const content = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
      return;
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
  }
  
  // Default 404
  sendJSON(res, { error: 'Not found' }, 404);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});