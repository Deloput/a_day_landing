# A DAY Landing Page

**AI-powered event discovery and trip planning web application**

React + TypeScript + Vite application showcasing local events with AI-generated content and interactive maps.

---

## 🚀 Features

- **AI-Generated Events**: Powered by Google Gemini 2.0 Flash
- **Interactive Maps**: Leaflet-based map with event markers
- **Smart Loading**: Skeleton UI with 2-second timeout and background retry
- **Responsive Design**: Optimized for desktop and mobile
- **Graceful Degradation**: Fallback events if API unavailable
- **SEO Optimized**: Comprehensive meta tags and structured data

---

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0, TypeScript
- **Build Tool**: Vite 6.4
- **AI**: Google Generative AI (@google/genai 1.29.0)
- **Maps**: Leaflet 1.9.4
- **Styling**: Tailwind CSS (CDN)
- **Deployment**: Firebase Hosting

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🎯 Quick Start

### Development

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### Production Build

```bash
npm run build
```

Output: `dist/` directory

---

## 🔑 Environment Variables

Create `.env.local`:

```
GEMINI_API_KEY=your_google_gemini_api_key
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 🏗️ Project Structure

```
a_day_landing_react/
├── components/
│   ├── EventCard.tsx       # Event display card
│   ├── SkeletonCard.tsx    # Loading placeholder
│   ├── Map.tsx             # Leaflet map component
│   └── StoryDialog.tsx     # Event details modal
├── services/
│   ├── gemini.ts           # AI event generation
│   └── geo.ts              # Geolocation service
├── App.tsx                 # Main application
├── index.tsx               # Entry point
├── types.ts                # TypeScript types
└── vite.config.ts          # Build configuration
```

---

## 🎨 Key Features Explained

### 1. Smart Loading (Skeleton UI)

- Shows loading skeleton after 2 seconds
- Continues loading in background (5 retries × 3 sec)
- Smooth transition to real data
- Never shows error screens to users

### 2. AI Event Generation

- Uses Gemini 2.0 Flash model
- Generates 8-12 real events for user's location
- Includes: title, description, coordinates, category
- Falls back to demo events if API unavailable

### 3. Background Retry Logic

- Exponential backoff (1s → 2s → 4s delays)
- 3 automatic retries on API errors
- Graceful degradation to fallback content
- User-friendly error messages

### 4. Responsive Maps

- Leaflet with OpenStreetMap tiles
- Custom markers for each event
- Click synchronization with event cards
- Mobile-optimized carousel view

---

## 📱 Responsive Design

### Desktop (>768px)
- Left sidebar: Event cards list
- Right panel: Interactive map
- Hover effects and smooth scrolling

### Mobile (<768px)
- Fullscreen map
- Bottom carousel: Horizontal event cards
- Floating header with city name

---

## 🔄 Loading States

```
1. Initial Load (0-2s)
   └── Spinner with "A DAY TODAY" logo

2. Skeleton UI (2s+)
   └── 4 animated placeholder cards
   └── "Loading events..." indicator
   └── Background retry every 3s

3. Data Loaded
   └── Real event cards with fade-in
   └── Map markers appear
   └── Fully interactive
```

---

## 🚀 Deployment

### Firebase Hosting

1. Build the project:
```bash
npm run build
```

2. Deploy (merged with Flutter app):
```bash
./deploy_merged.sh
```

This script:
- Builds React landing page
- Builds Flutter main app
- Merges both into single deployment
- Deploys to Firebase Hosting

**Result**:
- `aday.today/` → React Landing
- `aday.today/#/main` → Flutter App

---

## 🧪 Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:3000
```

### Test Scenarios

1. **Fast Loading**: API responds < 2s → Direct to content
2. **Slow Loading**: API > 2s → Skeleton UI → Real data
3. **API Error**: 503 errors → Skeleton UI → Fallback events
4. **No Internet**: Skeleton remains, retry in background

---

## 🐛 Troubleshooting

### White Screen

```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run dev
```

### API Errors

- Check `.env.local` exists with valid API key
- Verify API key in [Google Cloud Console](https://console.cloud.google.com/)
- Check console for detailed error messages

### Geolocation Issues

- Allow location permission in browser
- Chrome may block on localhost (use http://localhost not https)

---

## 📊 Performance

- **First Contentful Paint**: < 2s
- **Time to Interactive**: ~2s (skeleton UI)
- **Full Load**: 2-5s (with real data)
- **Lighthouse Score Target**: 90+ (all categories)

---

## 🔐 Security

- API key in `.env.local` (not committed to git)
- Environment variables injected at build time
- Rate limiting recommended in production
- Consider backend proxy for API calls

---

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

Copyright © 2025 A DAY. All rights reserved.

---

## 🔗 Links

- **Production**: https://aday.today/
- **Main App**: https://aday.today/#/main
- **Repository**: https://github.com/Deloput/a_day_landing

---

**Built with ❤️ using React + Vite + Gemini AI**
