#!/bin/bash

# A DAY - Clean Git History from Exposed API Key
# ⚠️  WARNING: This will rewrite Git history and require force push!

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  ⚠️  GIT HISTORY CLEANING - DANGEROUS OPERATION           ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Confirmation
echo -e "${YELLOW}This script will:${NC}"
echo "1. Remove exposed API key from ALL commits"
echo "2. Rewrite Git history"
echo "3. Require force push to remote"
echo ""
echo -e "${RED}⚠️  WARNING: This cannot be undone easily!${NC}"
echo -e "${YELLOW}Make sure you have:${NC}"
echo "  - Backed up your work"
echo "  - Revoked the old API key in Google Console"
echo "  - Updated .env.local with new key"
echo "  - Coordinated with team (if not solo)"
echo ""
read -p "Type 'YES' to continue: " confirmation

if [ "$confirmation" != "YES" ]; then
  echo -e "${GREEN}Aborted. Good call - be safe!${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}Creating backup branch...${NC}"
git branch backup-before-history-clean-$(date +%Y%m%d-%H%M%S) || true
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Create replacements file
echo -e "${YELLOW}Creating replacements file...${NC}"
cat > /tmp/api_key_replacements.txt << 'EOF'
AIzaSyB5J3GiumByA1Q4VDIbzHwhwIZhy6kD17c==>***REMOVED***
EOF

echo -e "${GREEN}✅ Replacements file created${NC}"
echo ""

# Check if git-filter-repo is installed
if command -v git-filter-repo &> /dev/null; then
  echo -e "${GREEN}Using git-filter-repo (recommended)${NC}"
  
  git-filter-repo --replace-text /tmp/api_key_replacements.txt --force
  
elif command -v bfg &> /dev/null; then
  echo -e "${GREEN}Using BFG Repo-Cleaner${NC}"
  
  bfg --replace-text /tmp/api_key_replacements.txt
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  
else
  echo -e "${YELLOW}Neither git-filter-repo nor BFG found${NC}"
  echo -e "${YELLOW}Using git filter-branch (slower)${NC}"
  echo ""
  
  git filter-branch --force --index-filter \
    "git ls-files -z | xargs -0 sed -i '' 's/AIzaSyB5J3GiumByA1Q4VDIbzHwhwIZhy6kD17c/***REMOVED***/g' 2>/dev/null || true" \
    --prune-empty --tag-name-filter cat -- --all
  
  # Cleanup
  rm -rf .git/refs/original/
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
fi

echo ""
echo -e "${GREEN}✅ Git history cleaned${NC}"
echo ""

# Verify
echo -e "${YELLOW}Verifying cleanup...${NC}"
if git log --all -S "AIzaSyB5J3Giu" --oneline; then
  echo -e "${RED}❌ Key still found in history!${NC}"
  echo -e "${YELLOW}Manual cleanup required${NC}"
  exit 1
else
  echo -e "${GREEN}✅ No key found in history${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ CLEANUP COMPLETE                                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Review changes:"
echo "   git log --oneline | head -10"
echo ""
echo "2. Force push to remote (⚠️  DESTRUCTIVE):"
echo -e "   ${RED}git push origin main --force${NC}"
echo ""
echo "3. Notify team members to:"
echo "   git fetch origin"
echo "   git reset --hard origin/main"
echo ""
echo -e "${YELLOW}⚠️  After force push, old commits become orphaned${NC}"
echo -e "${YELLOW}   Anyone who pulled before will have conflicts${NC}"
echo ""
echo -e "${GREEN}Backup branch saved:${NC}"
git branch | grep backup-before-history-clean
echo ""

# Cleanup temp file
rm -f /tmp/api_key_replacements.txt

echo -e "${GREEN}Ready to force push? (Review carefully first!)${NC}"

