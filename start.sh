#!/bin/bash

# Start the backend server
echo "Starting backend server on port 4000..."
PORT=4000 npx ts-node src/server.ts &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Start the frontend server
echo "Starting frontend server on port 3002..."
npx vite --port 3002 &
FRONTEND_PID=$!

echo "Both servers are running!"
echo "Frontend: http://localhost:3002"
echo "Backend API: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait