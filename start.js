// 学習アプリケーション開始スクリプト
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 学習アプリケーションを起動しています...');
console.log('📚 算数・国語問題アプリ');
console.log('=' * 50);

// アプリケーションの実行
const child = spawn('node', [path.join(__dirname, 'working-app.js')], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('close', (code) => {
  console.log(`アプリケーションが終了しました。コード: ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});

// Ctrl+C でアプリケーションを終了
process.on('SIGINT', () => {
  console.log('\n🛑 アプリケーションを終了しています...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 アプリケーションを終了しています...');
  child.kill('SIGTERM');
});