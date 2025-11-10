# 🚨 SECURITY INCIDENT RESPONSE

**Date**: November 10, 2025  
**Incident**: Google API Key exposed in public repository  
**Repository**: Deloput/a_day_landing  
**Severity**: CRITICAL  
**Status**: IN PROGRESS

---

## 🔴 IMMEDIATE ACTIONS REQUIRED

### Step 1: Revoke Compromised API Key ⚡ URGENT

1. **Go to Google Cloud Console**:
   - URL: https://console.cloud.google.com/apis/credentials
   - Project: `projects/1087329021451`

2. **Find the API Key**:
   - Look for key name: "A DAY TODAY AGENT"
   - Key starts with: `AIzaSyB5J3Giu...`

3. **REVOKE the key immediately**:
   - Click on the key
   - Click "DELETE" or "REGENERATE"
   - Confirm deletion

**⏱️ Time Critical**: Do this NOW before continuing

---

### Step 2: Generate New API Key

1. In Google Cloud Console → APIs & Services → Credentials
2. Click "+ CREATE CREDENTIALS" → API Key
3. Name it: "A DAY TODAY - November 2025"
4. **Restrict the key**:
   - Application restrictions: HTTP referrers
   - Website restrictions:
     - `https://aday.today/*`
     - `http://localhost:3000/*` (for dev)
   - API restrictions: Generative Language API only
5. **Copy the new key** (save it temporarily)

---

### Step 3: Update Local Environment

\`\`\`bash
cd /Users/davidoff/StudioProjects/a_day_landing_react

# Update .env.local with new key
echo "GEMINI_API_KEY=YOUR_NEW_KEY_HERE" > .env.local

# Verify .env.local is in .gitignore
grep -q ".env.local" .gitignore && echo "✅ .env.local is ignored" || echo "❌ NOT IGNORED!"
\`\`\`

---

### Step 4: Clean Git History (if key was committed)

Since the key was exposed, we need to remove it from Git history:

\`\`\`bash
cd /Users/davidoff/StudioProjects/a_day_landing_react

# Check if key exists in history
git log --all -S "AIzaSyB5J3Giu" --oneline

# If found, use BFG Repo-Cleaner (safer than git filter-branch)
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/

# Remove key from all commits
java -jar bfg.jar --replace-text replacements.txt

# Or use git filter-repo (if installed)
git filter-repo --replace-text replacements.txt

# After cleaning, force push (DANGEROUS - inform team first!)
git push origin main --force
\`\`\`

**⚠️ WARNING**: Force push will rewrite history. Coordinate with team!

---

### Step 5: Verify Key Removal

\`\`\`bash
# Search current files
grep -r "AIzaSyB5J3Giu" .

# Search Git history
git log --all -S "AIzaSyB5J3Giu"

# If both return nothing → ✅ Clean
\`\`\`

---

### Step 6: Update Documentation

Remove any references to the old key in:
- [ ] README.md
- [ ] IMPLEMENTATION_SUMMARY.md
- [ ] Any .md files
- [ ] Code comments
- [ ] Commit messages (if possible)

**Replace with**: "See .env.local.example for setup"

---

## 🔐 PREVENTION MEASURES

### A. Create .env.local.example

\`\`\`bash
# .env.local.example
GEMINI_API_KEY=your_api_key_here
\`\`\`

Commit this template (without real key) for other developers.

### B. Add Pre-commit Hook

Create `.git/hooks/pre-commit`:

\`\`\`bash
#!/bin/bash
if git diff --cached | grep -q "AIzaSy"; then
    echo "❌ ERROR: Potential API key detected in commit!"
    echo "Remove it before committing."
    exit 1
fi
\`\`\`

Make executable: `chmod +x .git/hooks/pre-commit`

### C. Enable GitGuardian (Already Active)

- [x] GitGuardian monitoring enabled
- [x] Email alerts configured
- [ ] Setup Slack notifications (optional)

### D. Use Secrets Management

For production:
- Firebase Functions: Use environment config
- GitHub Actions: Use encrypted secrets
- Vercel/Netlify: Use environment variables UI

---

## 📊 IMPACT ASSESSMENT

### Exposure Details

- **Repository**: Public (Deloput/a_day_landing)
- **Exposure Time**: From commit until detection (~few hours)
- **Key Restrictions**: None (full access to Gemini API)
- **Usage Monitoring**: Check Google Cloud Console for unauthorized usage

### Potential Risks

- ⚠️ **High**: Unauthorized API calls (costs money)
- ⚠️ **Medium**: Quota exhaustion (service disruption)
- ⚠️ **Low**: Data access (API is read-only for events)

### Check for Abuse

1. Go to Google Cloud Console → Billing → Reports
2. Check API usage spikes for dates: Nov 10-11, 2025
3. Look for unusual geographic locations
4. Check for quota warnings

---

## ✅ CHECKLIST

Post-Incident Verification:

- [ ] Old API key revoked/deleted
- [ ] New API key generated with restrictions
- [ ] .env.local updated locally
- [ ] .env.local confirmed in .gitignore
- [ ] Git history cleaned (if key was committed)
- [ ] All documentation updated
- [ ] Team notified (if applicable)
- [ ] Pre-commit hook installed
- [ ] No unauthorized API usage detected
- [ ] GitGuardian alert resolved
- [ ] .env.local.example created
- [ ] Security incident logged

---

## 📞 CONTACTS

**Security Issues**: security@aday.today  
**GitHub Support**: https://support.github.com  
**GitGuardian**: https://dashboard.gitguardian.com  
**Google Cloud Support**: https://support.google.com/cloud

---

## 📝 LESSONS LEARNED

1. **Never commit API keys** - even in private repos
2. **Use .env.local** for all sensitive data
3. **Restrict API keys** with HTTP referrers and API limits
4. **Enable monitoring** (GitGuardian, Snyk, etc.)
5. **Rotate keys regularly** (every 90 days)
6. **Document procedures** for incident response

---

## 🔄 REGULAR SECURITY PRACTICES

### Monthly

- [ ] Review API key usage
- [ ] Check for exposed secrets (git-secrets, truffleHog)
- [ ] Rotate production keys

### Quarterly

- [ ] Full security audit
- [ ] Update dependencies
- [ ] Review access controls

### Annually

- [ ] Penetration testing
- [ ] Security training
- [ ] Incident response drill

---

**Report Status**: IN PROGRESS  
**Next Review**: After all checklist items completed  
**Responsible**: Development Lead

---

## 🚀 MOVING FORWARD

Once all steps are completed:

1. Mark this incident as RESOLVED
2. Update team documentation
3. Schedule security review meeting
4. Implement additional monitoring

**Remember**: Security is ongoing, not a one-time fix.

