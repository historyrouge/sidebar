#!/bin/bash

# Start the backend server
echo "Starting backend server on port 5000..."
PORT=5000 node dist/server.js &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Start the frontend server
echo "Starting frontend server..."
npm run dev:client &
FRONTEND_PID=$!

echo "Backend server PID: $BACKEND_PID"
echo "Frontend server PID: $FRONTEND_PID"
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3006 (or next available port)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait