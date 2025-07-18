const { spawn } = require('child_process');
const path = require('path');

console.log('Starting combined server...');

// Start backend server
const backend = spawn('npx', ['ts-node', 'index.ts'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

// Wait a moment for backend to start
setTimeout(() => {
  // Start frontend server
  const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '8080'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit'
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  frontend.on('exit', (code) => {
    console.log(`Frontend server exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });

  backend.on('exit', (code) => {
    console.log(`Backend server exited with code ${code}`);
    frontend.kill();
    process.exit(code);
  });
}, 2000);

backend.on('error', (error) => {
  console.error('Backend server error:', error);
  process.exit(1);
});

console.log('Backend server starting on port 3000...');
console.log('Frontend server will start on port 8080...');