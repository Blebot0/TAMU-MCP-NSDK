#!/bin/bash

# ============================================
# CodeWhisper Forge - Quick Start Script
# ============================================

set -e

echo ""
echo "============================================"
echo "🛠️  CodeWhisper Forge - Quick Start"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo ""
    echo "Please create .env file:"
    echo "  1. cp .env.example .env"
    echo "  2. Edit .env and add your GEMINI_API_KEY"
    echo ""
    echo "Get your Gemini API key from:"
    echo "  https://makersuite.google.com/app/apikey"
    echo ""
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=.*[a-zA-Z]" .env; then
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY not configured in .env${NC}"
    echo ""
    echo "Please add your Gemini API key to .env file"
    echo "Get it from: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
    echo ""
fi

# Check if Python dependencies are installed
if ! python3 -c "import streamlit" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    pip3 install -r requirements.txt
    echo ""
fi

echo -e "${GREEN}✅ All dependencies installed!${NC}"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend
echo -e "${GREEN}🚀 Starting backend server...${NC}"
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend failed to start!${NC}"
    echo ""
    echo "Check the logs above for errors"
    exit 1
fi

echo -e "${GREEN}✅ Backend running at http://localhost:3000${NC}"
echo ""

# Start frontend
echo -e "${GREEN}🚀 Starting frontend UI...${NC}"
echo ""
streamlit run app.py &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo -e "${GREEN}✅ CodeWhisper Forge is running!${NC}"
echo "============================================"
echo ""
echo "📡 Backend:  http://localhost:3000"
echo "🎨 Frontend: http://localhost:8501"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for processes
wait

