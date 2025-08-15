#!/bin/bash

# FreelancerPro Frontend Development Startup Script

echo "🚀 Starting FreelancerPro Frontend Development Environment"
echo "=================================================="

# Check if we're in the Frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the Frontend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:5000"
else
    echo "⚠️  Backend is not running at http://localhost:5000"
    echo "   Please start the backend first by running:"
    echo "   cd ../Backend && ./start-dev.sh"
    echo ""
    echo "   Or start it manually with:"
    echo "   cd ../Backend && npm run dev"
    echo ""
    read -p "Continue anyway? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🎯 Starting frontend development server..."
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔗 API calls will be proxied to: http://localhost:5000"
echo ""

# Start the development server
npm run dev
