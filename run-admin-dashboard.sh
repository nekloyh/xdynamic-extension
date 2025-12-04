#!/bin/bash
# Script chạy admin dashboard với environment management

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/frontend/admin-dashboard"

ENV="${1:-development}"  # Default là development nếu không chỉ định
COMMAND="${2:-dev}"      # Default là dev nếu không chỉ định

# Validate environment
if [[ ! "$ENV" =~ ^(development|test|production)$ ]]; then
    echo "❌ Invalid environment: $ENV"
    echo ""
    echo "Usage: ./run-admin-dashboard.sh [environment] [command]"
    echo ""
    echo "Environments:"
    echo "  development  - Local development (default, uses .env.development)"
    echo "  test         - Test/staging (uses .env.test)"
    echo "  production   - Production (uses .env.production)"
    echo ""
    echo "Commands:"
    echo "  dev          - Start dev server (default for development)"
    echo "  build        - Build for distribution"
    echo "  preview      - Preview production build"
    echo ""
    echo "Examples:"
    echo "  ./run-admin-dashboard.sh                      # Dev server"
    echo "  ./run-admin-dashboard.sh test dev             # Test dev server"
    echo "  ./run-admin-dashboard.sh production build     # Build production"
    exit 1
fi

# Map commands
if [[ "$ENV" == "development" && "$COMMAND" == "dev" ]]; then
    CMD="npm run dev"
elif [[ "$COMMAND" == "build" ]]; then
    CMD="npm run build"
elif [[ "$COMMAND" == "preview" ]]; then
    CMD="npm run preview"
else
    CMD="npm run $COMMAND"
fi

echo ""
echo "=================================="
echo "🎨 Admin Dashboard Manager"
echo "=================================="
echo "Environment: $ENV"
echo "Config File: .env.$ENV"
echo "Command: $CMD"
echo ""

# Run command
NODE_ENV="$ENV" eval "$CMD"
