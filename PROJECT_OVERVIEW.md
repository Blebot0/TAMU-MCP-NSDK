# 📦 CodeWhisper Forge - Project Overview

**Complete documentation and setup files have been created for local hosting!**

---

## 📚 Documentation Files Created

### 🎯 Essential Files

| File | Purpose | Read This If... |
|------|---------|-----------------|
| **README.md** | Complete project documentation | You want full details about the project |
| **QUICKSTART.md** | 5-minute setup guide | You want to get started immediately |
| **SETUP.md** | Detailed step-by-step setup | You need help with installation |
| **.env.example** | Environment variables template | You need to configure API keys |
| **requirements.txt** | Python dependencies | You need to install Python packages |
| **package.json** | Node.js configuration | Updated with project metadata |
| **.gitignore** | Git ignore rules | Protecting sensitive files |
| **start.sh** | Automated startup script | You want one-command launch |

### 📖 Reference Documentation

| File | Purpose |
|------|---------|
| **API.md** | Complete API reference with examples |
| **CONTRIBUTING.md** | Guidelines for contributing to the project |

---

## 🏗️ Project Structure

```
TAMU-MCP-NSDK/
│
├── 📄 Core Application Files
│   ├── server.js              # Node.js Express backend (AI + APIs)
│   ├── app.py                 # Python Streamlit frontend (UI)
│   └── package.json           # Node.js configuration
│
├── 🔧 Configuration Files
│   ├── .env.example           # Environment variables template
│   ├── .gitignore            # Git ignore rules
│   ├── requirements.txt       # Python dependencies
│   └── start.sh              # Quick start script
│
├── 📚 Documentation
│   ├── README.md             # Main documentation (9.6 KB)
│   ├── QUICKSTART.md         # Quick setup guide
│   ├── SETUP.md              # Detailed setup (7.8 KB)
│   ├── API.md                # API reference (11.1 KB)
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   └── PROJECT_OVERVIEW.md   # This file
│
└── 📦 Dependencies
    └── node_modules/         # Node.js packages (already installed)
```

---

## 🎯 What This Project Does

**CodeWhisper Forge** is an AI-powered developer assistant that:

### Core Features

1. **🔍 Smart Query Analysis**
   - Uses Google Gemini AI to understand developer problems
   - Extracts keywords, tech stack, and severity automatically

2. **🎯 Issue Resolution Predictor (IRP)**
   - Analyzes similar closed GitHub issues
   - Calculates success rates for different solutions
   - Provides evidence-based recommendations

3. **🤖 Auto-Fix Generator (AFG)**
   - Generates code fixes using AI
   - Creates pull-ready file changes
   - Supports dry-run testing mode

4. **🌐 Multi-Source Context**
   - GitHub: Issues, commits, repository info
   - Stack Overflow: Relevant Q&A
   - AI-enhanced comprehensive responses

### Technology Stack

**Backend (Node.js)**
- Express.js web server
- Google Gemini AI
- GitHub API integration
- Stack Overflow API
- Node-cache for performance

**Frontend (Python)**
- Streamlit for beautiful UI
- Matplotlib for visualizations
- Interactive result display

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
# Node.js
npm install

# Python
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit and add your Gemini API key
# Get it from: https://makersuite.google.com/app/apikey
```

### Step 3: Start Application

```bash
# Automated (recommended)
./start.sh

# OR manually in two terminals:
# Terminal 1:
node server.js

# Terminal 2:
streamlit run app.py
```

Then open: **http://localhost:8501**

---

## 🔑 Required API Keys

### 1. Gemini API Key (REQUIRED)

**Why:** Powers AI analysis and fix generation

**Get it:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and add to `.env`:
   ```
   GEMINI_API_KEY=AIzaSy...your-key...
   ```

### 2. GitHub Token (OPTIONAL but recommended)

**Why:** Increases API rate limit from 60 to 5,000 requests/hour

**Get it:**
1. Visit: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `public_repo`, `read:org`
4. Copy and add to `.env`:
   ```
   GITHUB_TOKEN=ghp_...your-token...
   ```

---

## 📋 Documentation Guide

### For First-Time Setup
1. Read **QUICKSTART.md** (fastest way)
2. Or read **SETUP.md** (detailed guide)

### For Daily Use
1. **README.md** - Complete reference
2. **API.md** - API endpoint details

### For Development
1. **CONTRIBUTING.md** - Contribution guidelines
2. **API.md** - Technical implementation details

---

## 🎬 Example Usage

### Web Interface (Recommended)

1. Open http://localhost:8501
2. Enter query: `Memory leak with Node 22 fetch`
3. Set repository: `vercel/next.js`
4. Enable features:
   - ✅ Issue Resolution Predictor
   - ⬜ Auto-Fix Generator (optional)
5. Click "⚡ Analyze"
6. View results in multiple tabs:
   - 🤖 AI Response
   - 🎯 Success Predictions
   - 📦 Repository Info
   - 💡 Stack Overflow Solutions
   - 🔧 Auto-Fix (if enabled)

### API Usage

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Authentication timeout with JWT",
    "repoOwner": "supabase",
    "repoName": "auth",
    "enableIRP": true
  }'
```

---

## 🎯 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check server status |
| `/mcp` | POST | Main analysis endpoint |

---

## 📊 Features Breakdown

### Issue Resolution Predictor (IRP)

**What it does:**
- Searches for similar closed issues
- Analyzes solution success patterns
- Calculates success rates
- Provides confidence scores

**Example output:**
```
🎯 UPGRADE DEPENDENCY — 85.7% Success Rate
   ✅ Worked: 12 times
   ❌ Failed: 2 times
   🎲 Confidence: HIGH
   📚 Evidence: #11234, #10956, #10123
```

### Auto-Fix Generator (AFG)

**What it does:**
- Generates code fixes using AI
- Creates file changes with explanations
- Supports dry-run mode
- Can create GitHub PRs (with token)

**Example output:**
```
📝 Proposed Changes:
   📄 src/utils/fetch.js
      + 10 lines added
      - 2 lines removed
      Reason: Add AbortController to prevent memory leak
```

---

## 🔧 Configuration Options

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_key_here

# Optional but recommended
GITHUB_TOKEN=your_token_here

# Optional
HF_TOKEN=your_hf_token_here
PORT=3000
```

### Runtime Configuration

**In Web UI:**
- Toggle IRP on/off
- Toggle AFG on/off
- Set AFG to dry-run mode
- Choose base branch for PRs

**In API:**
```json
{
  "enableIRP": true,
  "enableAFG": {
    "dryRun": true,
    "base": "main"
  }
}
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check port availability
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Verify dependencies
npm install
```

### Frontend Won't Start

```bash
# Install dependencies
pip install -r requirements.txt

# Check Python version (need 3.8+)
python3 --version
```

### API Key Issues

```bash
# Verify .env exists
ls -la .env

# Check format (no spaces around =)
cat .env

# Restart server after changes
```

### Can't Connect to Backend

```bash
# Test health endpoint
curl http://localhost:3000/health

# Check if backend is running
ps aux | grep "node server.js"

# Check firewall settings
```

---

## 📈 Performance Tips

1. **Use GitHub Token** - 5,000 vs 60 requests/hour
2. **Enable Caching** - Already built-in (5 min TTL)
3. **Disable IRP for Simple Queries** - Faster response
4. **Use Dry-Run for AFG** - Test before creating PRs

---

## 🔒 Security Notes

1. **Never commit `.env`** - Contains sensitive keys
2. **Use `.gitignore`** - Already configured
3. **Rotate keys regularly** - Security best practice
4. **Review AFG changes** - Before applying fixes
5. **Minimal token scopes** - Only what's needed

---

## 🚀 Deployment Options

### Local Development (Current)
- Backend: http://localhost:3000
- Frontend: http://localhost:8501

### Production (Future Options)
- **Backend**: Deploy to Heroku, Railway, or Render
- **Frontend**: Streamlit Cloud or Docker container
- **Environment**: Use production environment variables

---

## 📝 Next Steps

After setup, you can:

1. ✅ **Test the Application**
   - Try example queries
   - Explore different repositories
   - Test IRP and AFG features

2. ✅ **Customize**
   - Adjust cache TTL in `server.js`
   - Modify UI colors in `app.py`
   - Add custom solution patterns

3. ✅ **Extend**
   - Add support for GitLab
   - Integrate more AI models
   - Add custom analytics

4. ✅ **Contribute**
   - Read `CONTRIBUTING.md`
   - Submit bug reports
   - Add new features

---

## 📞 Getting Help

### Documentation
1. Check **QUICKSTART.md** for quick issues
2. Read **SETUP.md** for setup problems
3. Review **API.md** for API questions
4. Check **README.md** troubleshooting section

### Common Issues
- Port conflicts → Change PORT in `.env`
- API rate limits → Add GITHUB_TOKEN
- AI not working → Verify GEMINI_API_KEY
- Connection errors → Check backend is running

---

## 🎉 You're All Set!

All documentation and configuration files are ready. To start:

```bash
# Quick start
./start.sh

# Or read the docs first
cat QUICKSTART.md
```

**Happy Coding! 🚀**

---

## 📊 Project Statistics

- **Total Documentation**: 6 markdown files
- **Setup Scripts**: 1 automated script
- **Configuration Files**: 3 files
- **Total Documentation Size**: ~40 KB
- **Languages**: JavaScript, Python, Markdown, Bash

---

**Last Updated**: November 9, 2025
**Version**: 1.0.0
**License**: ISC

