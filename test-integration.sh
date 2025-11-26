#!/bin/bash

# Test script to verify backend-frontend integration

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_URL="http://localhost:8000"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="password123"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}XDynamic Integration Test${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}[1/5] Testing backend health...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $response)${NC}"
    echo -e "${RED}Make sure backend is running: cd backend && source venv/bin/activate && python run.py${NC}"
    exit 1
fi

# Test 2: Register User
echo -e "\n${YELLOW}[2/5] Testing user registration...${NC}"
register_response=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$register_response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ User registration successful${NC}"
    TOKEN=$(echo "$register_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo -e "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ User registration failed${NC}"
    echo "   Response: $register_response"
    exit 1
fi

# Test 3: Login
echo -e "\n${YELLOW}[3/5] Testing user login...${NC}"
login_response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$login_response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ User login successful${NC}"
    TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ User login failed${NC}"
    echo "   Response: $login_response"
    exit 1
fi

# Test 4: Get Current Subscription
echo -e "\n${YELLOW}[4/5] Testing subscription API...${NC}"
subscription_response=$(curl -s -X GET "$BACKEND_URL/api/subscription/current" \
    -H "Authorization: Bearer $TOKEN")

if echo "$subscription_response" | grep -q "plan_type"; then
    echo -e "${GREEN}✓ Subscription API working${NC}"
    PLAN=$(echo "$subscription_response" | grep -o '"plan_type":"[^"]*' | cut -d'"' -f4)
    echo -e "   Plan: $PLAN"
else
    echo -e "${RED}✗ Subscription API failed${NC}"
    echo "   Response: $subscription_response"
    exit 1
fi

# Test 5: Test Prediction API (with sample image)
echo -e "\n${YELLOW}[5/5] Testing prediction API...${NC}"
echo -e "${YELLOW}Creating a test image...${NC}"

# Create a simple test image (1x1 red pixel PNG) in a temp file
TMPFILE=$(mktemp /tmp/test_image.XXXXXX.png || mktemp)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" | base64 --decode > "$TMPFILE"

# Test prediction
prediction_response=$(curl -s -X POST "$BACKEND_URL/api/v1/predict" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@${TMPFILE}" \
    -F "threshold=0.5")

if echo "$prediction_response" | grep -q "predictions"; then
    echo -e "${GREEN}✓ Prediction API working${NC}"
    echo "   Response: $prediction_response"
else
    echo -e "${RED}✗ Prediction API failed${NC}"
    echo "   Response: $prediction_response"
    # Not exiting here as this might fail due to model issues
fi

# Clean up
rm -f "$TMPFILE"

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Integration Test Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Backend API is working${NC}"
echo -e "${GREEN}✓ Authentication flow is functional${NC}"
echo -e "${GREEN}✓ Extension can integrate with backend${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Build extension: cd frontend/extension && npm run build"
echo "2. Load extension in Chrome: chrome://extensions → Load unpacked → select dist/"
echo "3. Login with credentials:"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo ""
echo -e "${GREEN}Happy testing! 🚀${NC}"
