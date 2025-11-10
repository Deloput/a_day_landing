# 🚀 A DAY - Deployment Guide

## 📋 Архитектура

У вас есть **2 отдельных приложения**:

1. **React Landing** (`a_day_landing_react/`) - Лендинг с картой событий
2. **Flutter Main App** (`a_day/`) - Основное приложение с навигацией

**Текущий деплой**: https://aday.today/#/main (только Flutter app)

**Цель**: 
- `https://aday.today/` → React Landing
- `https://aday.today/#/main` → Flutter Main App

---

## ✅ Что уже сделано

- [x] Склонирован React landing из GitHub
- [x] Установлены зависимости (`npm install`)
- [x] Проект собран (`npm run build`)
- [x] Настроен Firebase Hosting (`firebase.json`, `.firebaserc`)
- [x] Создан умный deployment скрипт

---

## 🎯 Стратегия деплоя

### Проблема

Firebase Hosting может обслуживать только одну директорию. Если мы деплоим лендинг, это перезапишет основное приложение.

### Решение: Merged Deployment ⭐

Скрипт `deploy_merged.sh` делает следующее:

1. Собирает React landing → `dist/`
2. Собирает Flutter app → `build/web/`
3. Создает `dist_merged/`:
   ```
   dist_merged/
   ├── index.html          (Flutter app)
   ├── flutter.js          (Flutter app files)
   ├── assets/             (Flutter app assets)
   ├── landing/
   │   ├── index.html      (React landing)
   │   └── assets/         (React landing assets)
   ```
4. Настраивает Firebase rewrites:
   - `/` → React landing
   - `/#/main` → Flutter app (hash routing)
5. Деплоит объединенную директорию

---

## 🚀 Как задеплоить

### Option 1: Используйте готовый скрипт (Рекомендуется)

```bash
cd /Users/davidoff/StudioProjects/a_day_landing_react
./deploy_merged.sh
```

Скрипт автоматически:
- Соберет оба приложения
- Объединит их
- Задеплоит на Firebase

### Option 2: Ручной деплой

```bash
# 1. Собрать React landing
cd /Users/davidoff/StudioProjects/a_day_landing_react
npm run build

# 2. Собрать Flutter app
cd /Users/davidoff/StudioProjects/a_day
flutter build web --release

# 3. Объединить (скопировать вручную)
# ... см. deploy_merged.sh для деталей

# 4. Деплой
firebase deploy --only hosting
```

---

## 📊 После деплоя

### URLs

- **Landing**: https://aday.today/
- **Main App**: https://aday.today/#/main

### Проверка

```bash
# Проверить landing
curl -I https://aday.today/

# Проверить main app
curl -I https://aday.today/#/main
```

---

## ⚠️ Важные заметки

### 1. Hash Routing

Flutter app использует hash routing (`#/main`), поэтому он не конфликтует с React landing на root.

### 2. Rewrites

Firebase настроен так:
```json
{
  "rewrites": [
    { "source": "/", "destination": "/landing/index.html" },
    { "source": "/landing/**", "destination": "/landing/index.html" },
    { "source": "**", "destination": "/index.html" }
  ]
}
```

Это значит:
- `/` → React landing
- `/landing/*` → React landing (SPA routing)
- Все остальное (включая `#/main`) → Flutter app

### 3. API Keys

React landing использует Gemini API key из `.env.local`:
```
GEMINI_API_KEY=AIzaSyB5J3GiumByA1Q4VDIbzHwhwIZhy6kD17c
```

**ВАЖНО**: API key встроен в клиентский код! Рекомендуется:
- Ограничить key в Google Console (только домен aday.today)
- Или использовать backend proxy для API calls

---

## 🔧 Troubleshooting

### Проблема: После деплоя открывается старое приложение

**Решение**: Очистите кэш браузера или откройте в режиме инкогнито.

### Проблема: Main app не работает на /#/main

**Решение**: Проверьте, что Flutter app скопирован в `dist_merged/` корректно.

### Проблема: Landing показывает ошибку API

**Решение**: Проверьте, что `.env.local` создан и содержит правильный API key.

---

## 📝 Структура проекта

```
/Users/davidoff/StudioProjects/
│
├── a_day/                          # Flutter main app
│   ├── lib/
│   ├── build/web/                 # Build output
│   ├── firebase.json
│   └── .firebaserc
│
└── a_day_landing_react/            # React landing
    ├── components/
    ├── services/
    ├── dist/                       # Build output
    ├── dist_merged/                # Merged build (auto-generated)
    ├── firebase.json
    ├── .firebaserc
    ├── deploy_merged.sh            # Smart deployment script
    └── DEPLOYMENT_README.md        # This file
```

---

## 🎯 Quick Commands

```bash
# Собрать только landing
cd /Users/davidoff/StudioProjects/a_day_landing_react
npm run build

# Деплой (умный, объединенный)
./deploy_merged.sh

# Локальный тест
npm run dev      # Откроется на localhost:3000
```

---

## ✅ Checklist перед деплоем

- [ ] `.env.local` создан с правильным API key
- [ ] Flutter app работает локально
- [ ] React landing работает локально
- [ ] Firebase CLI установлен (`firebase --version`)
- [ ] Залогинены в Firebase (`firebase login`)
- [ ] Проект настроен (`firebase use aday-8683a`)

---

## 🚀 Ready to Deploy!

Всё готово! Просто запустите:

```bash
cd /Users/davidoff/StudioProjects/a_day_landing_react
./deploy_merged.sh
```

И оба приложения будут доступны на aday.today! 🎉

