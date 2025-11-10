#!/bin/bash

# A DAY - API Key Leak Fix Script
# This script helps you quickly respond to the API key leak

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  🚨 SECURITY INCIDENT: API Key Leak Fix                   ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check current status
echo -e "${BLUE}Step 1: Checking current status...${NC}"
echo ""

if [ -f ".env.local" ]; then
  echo -e "${GREEN}✅ .env.local exists${NC}"
  if grep -q "AIzaSyB5J3Giu" .env.local 2>/dev/null; then
    echo -e "${RED}❌ OLD KEY FOUND in .env.local!${NC}"
    echo -e "${YELLOW}   You need to replace it with a new key${NC}"
  else
    echo -e "${GREEN}✅ No old key in .env.local${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  .env.local not found${NC}"
  echo -e "${BLUE}   Creating template...${NC}"
  cat > .env.local << 'EOF'
# A DAY Landing - Environment Variables
# REPLACE with your actual API key

GEMINI_API_KEY=your_new_api_key_here
EOF
  echo -e "${GREEN}✅ Created .env.local template${NC}"
fi

echo ""

# Step 2: Check .gitignore
echo -e "${BLUE}Step 2: Verifying .gitignore...${NC}"
if grep -q ".env.local" .gitignore; then
  echo -e "${GREEN}✅ .env.local is in .gitignore${NC}"
else
  echo -e "${RED}❌ .env.local NOT in .gitignore!${NC}"
  echo -e "${BLUE}   Adding it now...${NC}"
  echo ".env.local" >> .gitignore
  echo -e "${GREEN}✅ Added .env.local to .gitignore${NC}"
fi

echo ""

# Step 3: Search for key in current files
echo -e "${BLUE}Step 3: Searching for exposed key in current files...${NC}"
if grep -r "AIzaSyB5J3Giu" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.log" 2>/dev/null; then
  echo -e "${RED}❌ KEY FOUND IN FILES ABOVE!${NC}"
  echo -e "${YELLOW}   Remove it manually before continuing${NC}"
else
  echo -e "${GREEN}✅ No key found in current files${NC}"
fi

echo ""

# Step 4: Check Git history
echo -e "${BLUE}Step 4: Checking Git history for key...${NC}"
if git log --all -S "AIzaSyB5J3Giu" --oneline | head -5; then
  echo -e "${RED}❌ KEY FOUND IN GIT HISTORY!${NC}"
  echo -e "${YELLOW}   You need to clean Git history${NC}"
  echo -e "${BLUE}   Options:${NC}"
  echo -e "   1. Use git-filter-repo (recommended)"
  echo -e "   2. Use BFG Repo-Cleaner"
  echo -e "   3. Contact team for coordinated force push"
else
  echo -e "${GREEN}✅ No key found in Git history${NC}"
fi

echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  MANUAL STEPS REQUIRED                                     ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${RED}🔴 IMMEDIATE (do this NOW):${NC}"
echo ""
echo "1. Go to Google Cloud Console:"
echo -e "   ${BLUE}https://console.cloud.google.com/apis/credentials${NC}"
echo ""
echo "2. Find key: 'A DAY TODAY AGENT'"
echo -e "   Starts with: ${YELLOW}AIzaSyB5J3Giu...${NC}"
echo ""
echo "3. DELETE the key immediately"
echo ""
echo "4. Create NEW key with restrictions:"
echo "   - Name: 'A DAY - $(date +%Y-%m)''"
echo "   - HTTP referrers: https://aday.today/*, http://localhost:3000/*"
echo "   - API: Generative Language API only"
echo ""
echo "5. Copy new key and paste into .env.local"
echo ""
echo -e "${GREEN}✅ After completing steps above:${NC}"
echo "   - Test the app: npm run dev"
echo "   - Verify new key works"
echo "   - Review SECURITY_INCIDENT_RESPONSE.md for full guide"
echo ""
echo -e "${BLUE}📖 Full documentation:${NC}"
echo "   cat SECURITY_INCIDENT_RESPONSE.md"
echo ""
echo -e "${YELLOW}⚠️  Remember: NEVER commit .env.local to Git!${NC}"
echo ""

