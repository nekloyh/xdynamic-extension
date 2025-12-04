#!/bin/bash
# Script chạy backend với environment management

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/backend"

ENV="${1:-development}"  # Default là development nếu không chỉ định
RELOAD="${2:---reload}"  # Default là --reload

# Validate environment
if [[ ! "$ENV" =~ ^(development|test|production)$ ]]; then
    echo "❌ Invalid environment: $ENV"
    echo ""
    echo "Usage: ./run-backend.sh [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  development  - Local development (default, uses .env)"
    echo "  test         - Test/staging server (uses .env.test)"
    echo "  production   - Production server (uses .env.production)"
    echo ""
    echo "Options:"
    echo "  --reload     - Auto-reload on code change (default for dev)"
    echo "  --no-reload  - Disable auto-reload"
    echo ""
    echo "Examples:"
    echo "  ./run-backend.sh                   # Dev with reload"
    echo "  ./run-backend.sh test              # Test without reload"
    echo "  ./run-backend.sh production        # Production"
    exit 1
fi

# Remove --reload if passed as second argument
if [[ "$RELOAD" == "--no-reload" ]]; then
    RELOAD=""
else
    if [[ "$ENV" != "production" ]]; then
        RELOAD="--reload"
    else
        RELOAD=""
    fi
fi

echo ""
echo "=================================="
echo "🚀 Starting Backend Server"
echo "=================================="
echo "Environment: $ENV"
echo "Config File: .env.$([[ "$ENV" == "development" ]] && echo "" || echo "$ENV")"
echo ""

# Run server
if [[ -z "$RELOAD" ]]; then
    python run.py --env "$ENV" --host 0.0.0.0
else
    python run.py --env "$ENV" --host 0.0.0.0 $RELOAD
fi
