# 🔑 How to Get New Gemini API Key

## ✅ CORRECT Place (Google AI Studio)

**URL**: https://makersuite.google.com/app/apikey

OR

**URL**: https://aistudio.google.com/apikey

### Steps:

1. Go to: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the new key
5. Paste into `.env.local`:
   ```
   GEMINI_API_KEY=your_new_key_here
   ```

---

## ❌ WRONG Place (Google Cloud Console)

**URL**: https://console.cloud.google.com/apis/credentials

This is for Google Cloud APIs (Maps, Translate, etc.)
NOT for Gemini AI APIs!

---

## 🔒 Security Settings (After Creating Key)

In Google AI Studio, you can restrict the key:
- Set usage limits
- Monitor API calls
- Restrict to specific IPs (if available)

---

## ✅ Current Status

- Old key: Already removed/revoked
- New key needed from: https://aistudio.google.com/apikey
- Update: `.env.local` with new key
- Test: `npm run dev`

---

**Important**: Google AI Studio keys are different from Google Cloud API keys!

