#!/bin/bash

# Kill any existing server processes
pkill -f "final-ai-server" || true
pkill -f "node.*server" || true

# Wait for processes to die
sleep 2

# Start the server
echo "Starting AI Learning App Server..."
cd /home/runner/workspace
node final-ai-server.js &

# Wait for server to start
sleep 5

# Test the server
echo "Testing server..."
curl -X POST http://localhost:3000/api/generate-question \
  -H "Content-Type: application/json" \
  -d '{"type": "math", "difficulty": 1}' \
  --max-time 10

echo ""
echo "Server should be running on http://localhost:3000"