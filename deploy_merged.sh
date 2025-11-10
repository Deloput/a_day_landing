#!/bin/bash

# Smart Firebase Deployment Script
# This merges the React landing page with the Flutter main app

set -e  # Exit on error

echo "🚀 A DAY - Smart Firebase Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
LANDING_DIR="/Users/davidoff/StudioProjects/a_day_landing_react"
MAIN_APP_DIR="/Users/davidoff/StudioProjects/a_day"
MERGED_DIR="$LANDING_DIR/dist_merged"

echo -e "${BLUE}📦 Step 1: Building React Landing Page...${NC}"
cd "$LANDING_DIR"
npm run build
echo -e "${GREEN}✅ Landing page built${NC}"
echo ""

echo -e "${BLUE}📦 Step 2: Building Flutter Main App...${NC}"
cd "$MAIN_APP_DIR"
flutter build web --release --web-renderer html
echo -e "${GREEN}✅ Main app built${NC}"
echo ""

echo -e "${BLUE}🔗 Step 3: Merging builds...${NC}"
# Create merged directory
rm -rf "$MERGED_DIR"
mkdir -p "$MERGED_DIR"

# Copy main Flutter app first (it will be the default)
echo "  → Copying Flutter app..."
cp -r "$MAIN_APP_DIR/build/web/"* "$MERGED_DIR/"

# Create a landing subdirectory
echo "  → Copying React landing to /landing..."
mkdir -p "$MERGED_DIR/landing"
cp -r "$LANDING_DIR/dist/"* "$MERGED_DIR/landing/"

echo -e "${GREEN}✅ Builds merged${NC}"
echo ""

echo -e "${BLUE}📝 Step 4: Creating Firebase config...${NC}"
cat > "$MERGED_DIR/../firebase_merged.json" << 'EOF'
{
  "hosting": {
    "public": "dist_merged",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/",
        "destination": "/landing/index.html"
      },
      {
        "source": "/landing/**",
        "destination": "/landing/index.html"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css|woff|woff2|ttf|otf)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
EOF
echo -e "${GREEN}✅ Firebase config created${NC}"
echo ""

echo -e "${BLUE}🔥 Step 5: Deploying to Firebase Hosting...${NC}"
cd "$LANDING_DIR"
firebase deploy --only hosting --config firebase_merged.json

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🌐 Your site is live:"
    echo "   Landing Page: ${YELLOW}https://aday.today/${NC}"
    echo "   Main App:     ${YELLOW}https://aday.today/#/main${NC}"
    echo ""
    echo -e "${BLUE}ℹ️  Note: Both apps are deployed and accessible!${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Done!${NC}"

