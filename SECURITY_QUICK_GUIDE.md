# 🚨 API Key Leak - Quick Action Guide

**Incident**: Google Gemini API Key exposed in public repo  
**Detected**: November 10, 2025 by GitGuardian  
**Status**: 🔴 ACTION REQUIRED

---

## ⚡ 5-MINUTE FIX

### Step 1: Revoke Old Key (2 min)
```
1. Open: https://console.cloud.google.com/apis/credentials
2. Find: "A DAY TODAY AGENT" 
3. DELETE it immediately
```

### Step 2: Generate New Key (1 min)
```
1. CREATE CREDENTIALS → API Key
2. Name: "A DAY - Nov 2025"
3. Restrict:
   - HTTP referrers: https://aday.today/*, http://localhost:3000/*
   - APIs: Generative Language API only
4. SAVE the new key
```

### Step 3: Update .env.local (1 min)
```bash
# Open .env.local and replace old key with new one
nano .env.local

# Replace:
GEMINI_API_KEY=AIzaSyB5J3Giu... (OLD - REVOKED)

# With:
GEMINI_API_KEY=your_new_key_here (NEW - RESTRICTED)
```

### Step 4: Test (1 min)
```bash
npm run dev
# Open http://localhost:3000
# Verify events load correctly
```

---

## 🔧 CLEANUP (10-15 min)

### Run Automated Fix
```bash
./fix_api_key_leak.sh
```

This checks:
- ✅ .env.local status
- ✅ .gitignore configuration
- ❌ Exposed keys in files
- ❌ Keys in Git history

### Clean Git History (if needed)
```bash
# ⚠️  DANGEROUS: Rewrites history
./clean_git_history.sh

# Type 'YES' to confirm
# Review changes
# Then force push:
git push origin main --force
```

---

## 📋 CHECKLIST

- [ ] Old key revoked in Google Console
- [ ] New key created with restrictions
- [ ] .env.local updated with new key
- [ ] App tested locally (npm run dev)
- [ ] dist/ deleted
- [ ] dist/ in .gitignore
- [ ] Git history cleaned (if needed)
- [ ] Force push completed (if history cleaned)
- [ ] GitGuardian alert resolved
- [ ] Team notified (if applicable)

---

## 📖 DETAILED GUIDES

- **Full Incident Response**: `SECURITY_INCIDENT_RESPONSE.md`
- **Diagnostic Script**: `./fix_api_key_leak.sh`
- **History Cleanup**: `./clean_git_history.sh`

---

## 🆘 NEED HELP?

### Common Issues

**Q: "Key still in dist/"**  
A: Delete it: `rm -rf dist/`

**Q: "Key in Git history"**  
A: Run `./clean_git_history.sh` (requires force push)

**Q: "New key not working"**  
A: Check restrictions in Google Console

**Q: "Team has conflicts after force push"**  
A: They need: `git fetch origin && git reset --hard origin/main`

---

## 🔒 PREVENTION

### Always:
- ✅ Use .env.local for keys
- ✅ Add .env.local to .gitignore
- ✅ Enable GitGuardian monitoring
- ✅ Restrict API keys in Google Console
- ✅ Review commits before pushing

### Never:
- ❌ Commit .env.local
- ❌ Put keys in code
- ❌ Put keys in documentation
- ❌ Put keys in commit messages
- ❌ Share keys in chat/email

---

## ⏱️ ESTIMATED TIME

| Task | Time | Priority |
|------|------|----------|
| Revoke key | 2 min | 🔴 Critical |
| Create new key | 1 min | 🔴 Critical |
| Update .env.local | 1 min | 🔴 Critical |
| Test app | 1 min | 🟡 High |
| Run fix script | 2 min | 🟡 High |
| Clean history | 10 min | 🟢 Medium |
| Force push | 1 min | 🟢 Medium |
| Documentation | 5 min | 🔵 Low |

**Total Critical Time**: 5 minutes  
**Total Time (with cleanup)**: 20-25 minutes

---

## ✅ COMPLETION

Once all tasks done:
1. Mark GitGuardian alert as resolved
2. Review API usage in Google Console
3. Monitor for unusual activity (next 24-48h)
4. Update team on resolution

---

**Last Updated**: November 10, 2025  
**Incident ID**: GitGuardian-ADAY-20251110  
**Resolution Status**: IN PROGRESS

🚀 **IMPORTANT**: Complete steps 1-3 immediately (5 min), cleanup can wait!

