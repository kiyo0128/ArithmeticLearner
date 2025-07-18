#!/bin/bash

# Start the backend server in the background
echo "Starting backend server..."
cd server && npx ts-node index.ts &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Start the frontend server
echo "Starting frontend server..."
cd ../client && npx vite --host 0.0.0.0 --port 8080 &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID