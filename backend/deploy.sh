#!/bin/bash

# Script deploy nhanh cho production
# Chạy: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting XDynamic Backend Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Docker
echo -e "${BLUE}[1/6]${NC} Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker found"

# Step 2: Check .env file
echo -e "${BLUE}[2/6]${NC} Checking environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  .env not found. Copying from .env.production...${NC}"
        cp .env.production .env
    elif [ -f ".env.example" ]; then
        echo -e "${YELLOW}⚠️  .env not found. Copying from .env.example...${NC}"
        cp .env.example .env
        echo -e "${RED}❌ Please edit .env file with production settings!${NC}"
        exit 1
    else
        echo -e "${RED}❌ No .env file found!${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓${NC} Environment file found"

# Step 3: Check required files
echo -e "${BLUE}[3/6]${NC} Checking required files..."
REQUIRED_FILES=("Dockerfile" "requirements.txt" "mobilenetv2_dangerous_objects.pth")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing required file: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓${NC} All required files present"

# Step 4: Create data directory
echo -e "${BLUE}[4/6]${NC} Creating data directory..."
mkdir -p data
echo -e "${GREEN}✓${NC} Data directory ready"

# Step 5: Build Docker image
echo -e "${BLUE}[5/6]${NC} Building Docker image..."
docker build -t xdynamic-api:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker image built successfully"

# Step 6: Start container
echo -e "${BLUE}[6/6]${NC} Starting container..."

# Stop old container if exists
if [ "$(docker ps -a -q -f name=xdynamic-api)" ]; then
    echo "Stopping old container..."
    docker stop xdynamic-api 2>/dev/null || true
    docker rm xdynamic-api 2>/dev/null || true
fi

# Start new container
docker run -d \
  --name xdynamic-api \
  --restart unless-stopped \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  xdynamic-api:latest

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start container!${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Container started"
echo ""

# Wait for API to be ready
echo -e "${BLUE}Waiting for API to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} API is ready!"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Display status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📦 Container: ${BLUE}xdynamic-api${NC}"
echo -e "🌐 API URL: ${BLUE}http://localhost:8000${NC}"
echo -e "📊 Health: ${BLUE}http://localhost:8000/health${NC}"
echo -e "📚 Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "🔍 Useful commands:"
echo -e "  View logs:     ${BLUE}docker logs -f xdynamic-api${NC}"
echo -e "  Stop:          ${BLUE}docker stop xdynamic-api${NC}"
echo -e "  Restart:       ${BLUE}docker restart xdynamic-api${NC}"
echo -e "  Remove:        ${BLUE}docker rm -f xdynamic-api${NC}"
echo ""

# Test API
echo -e "${BLUE}Testing API...${NC}"
HEALTH_STATUS=$(curl -s http://localhost:8000/health 2>/dev/null || echo "failed")
if [[ $HEALTH_STATUS == *"ok"* ]]; then
    echo -e "${GREEN}✓ API health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed. Check logs:${NC}"
    echo -e "  ${BLUE}docker logs xdynamic-api${NC}"
fi
echo ""
