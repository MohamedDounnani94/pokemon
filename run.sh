#!/bin/bash

# Pokemon API Run Script
# Usage: ./run.sh [mode]
# Modes: dev, prod, docker, test, build, lint

set -e

MODE=${1:-dev}

case $MODE in
  dev)
    echo "🚀 Starting in development mode..."
    npm run dev
    ;;
  
  prod)
    echo "🏗️  Building for production..."
    npm run build
    echo "🚀 Starting in production mode..."
    npm start
    ;;
  
  docker)
    echo "🐳 Starting with Docker Compose..."
    docker-compose build
    docker-compose up -d
    echo "✅ Service running on http://localhost:3000"
    echo "📝 View logs: docker-compose logs -f"
    echo "🛑 Stop service: docker-compose down"
    ;;
  
  docker-stop)
    echo "🛑 Stopping Docker Compose services..."
    docker-compose down
    echo "✅ Services stopped"
    ;;
  
  docker-logs)
    echo "📝 Viewing Docker Compose logs..."
    docker-compose logs -f
    ;;
  
  docker-build)
    echo "🐳 Building Docker image with Docker Compose..."
    docker-compose build
    echo "✅ Image built successfully"
    ;;
  
  test)
    echo "🧪 Running tests..."
    npm test
    ;;
  
  test-watch)
    echo "🧪 Running tests in watch mode..."
    npm run test:watch
    ;;
  
  test-coverage)
    echo "🧪 Running tests with coverage..."
    npm run test:coverage
    ;;
  
  build)
    echo "🏗️  Building TypeScript..."
    npm run build
    echo "✅ Build complete! Output in ./build"
    ;;
  
  lint)
    echo "🔍 Running linter..."
    npm run lint
    ;;
  
  lint-fix)
    echo "🔧 Running linter with auto-fix..."
    npm run lint-fix
    ;;
  
  clean)
    echo "🧹 Cleaning build artifacts..."
    npm run clean
    rm -rf node_modules
    echo "✅ Clean complete!"
    ;;
  
  install)
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    ;;
  
  *)
    echo "❌ Unknown mode: $MODE"
    echo ""
    echo "Available modes:"
    echo "  dev            - Run in development mode with hot reload"
    echo "  prod           - Build and run in production mode"
    echo "  docker         - Start with Docker Compose"
    echo "  docker-stop    - Stop Docker Compose services"
    echo "  docker-logs    - View Docker Compose logs"
    echo "  docker-build   - Build Docker image with Docker Compose"
    echo "  test           - Run tests once"
    echo "  test-watch     - Run tests in watch mode"
    echo "  test-coverage  - Run tests with coverage report"
    echo "  build          - Build TypeScript to JavaScript"
    echo "  lint           - Run ESLint"
    echo "  lint-fix      - Run ESLint with auto-fix"
    echo "  clean         - Remove build artifacts and node_modules"
    echo "  install       - Install dependencies"
    echo ""
    echo "Usage: ./run.sh [mode]"
    exit 1
    ;;
esac
