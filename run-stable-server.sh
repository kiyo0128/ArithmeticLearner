#!/bin/bash

echo "=== AI学習アプリ 安定版サーバー起動 ==="

# Kill any existing processes
echo "既存のプロセスを停止中..."
pkill -f "node.*server" -9 2>/dev/null || true
pkill -f "node.*3000" -9 2>/dev/null || true

# Wait for processes to die
sleep 3

# Start the stable server
echo "安定版サーバーを起動中..."
cd /home/runner/workspace
node stable-server.js &

# Wait for server to start
sleep 5

echo "サーバーテスト中..."

# Test math question generation
echo "算数問題テスト:"
curl -X POST http://localhost:3000/api/generate-question \
  -H "Content-Type: application/json" \
  -d '{"type": "math", "difficulty": 1}' \
  --max-time 10 2>/dev/null

echo ""
echo ""

# Test language question generation  
echo "国語問題テスト:"
curl -X POST http://localhost:3000/api/generate-question \
  -H "Content-Type: application/json" \
  -d '{"type": "language", "difficulty": 1}' \
  --max-time 10 2>/dev/null

echo ""
echo ""
echo "=== サーバーが起動しました ==="
echo "アクセス: http://localhost:3000"
echo "問題生成APIが動作中です"