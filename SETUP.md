# 🚀 CodeWhisper Forge - Setup Guide

Complete step-by-step setup instructions for local development.

---

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (need 18.x or higher)
node --version

# Check npm
npm --version

# Check Python version (need 3.8 or higher)
python3 --version

# Check pip
pip3 --version
```

If any are missing, install them first:
- **Node.js**: https://nodejs.org/
- **Python**: https://www.python.org/downloads/

---

## Step 1: Install Backend (Node.js)

```bash
# Navigate to project directory
cd /Users/keshavkapur/Downloads/TAMU-MCP-NSDK

# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected packages:**
- @google/genai
- @huggingface/inference
- axios
- dotenv
- express
- node-cache
- ollama

---

## Step 2: Install Frontend (Python)

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# OR if you have a virtual environment (recommended):
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Verify installation
pip list | grep -E "streamlit|requests|matplotlib"
```

---

## Step 3: Configure Environment Variables

### Create .env file

```bash
# Copy the example file
cp .env.example .env

# Edit with your favorite editor
nano .env  # or vim, code, etc.
```

### Get Gemini API Key (REQUIRED)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)
5. Paste into `.env`:
   ```
   GEMINI_API_KEY=AIzaSy...your-key-here...
   ```

### Get GitHub Token (OPTIONAL but recommended)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Set expiration: **90 days** (or your preference)
4. Select scopes:
   - ✅ `public_repo`
   - ✅ `read:org`
5. Click **"Generate token"**
6. Copy the token (starts with `ghp_...`)
7. Paste into `.env`:
   ```
   GITHUB_TOKEN=ghp_...your-token-here...
   ```

**Why you need it:**
- Without token: 60 API requests/hour
- With token: 5,000 API requests/hour

---

## Step 4: Start the Backend

```bash
# Make sure you're in the project directory
cd /Users/keshavkapur/Downloads/TAMU-MCP-NSDK

# Start the Node.js server
node server.js
```

**Expected output:**
```
============================================================
🔥 CodeWhisper Forge v9 - WINNING EDITION
============================================================

📡 Server: http://localhost:3000
✨ Features: Issue Resolution Predictor + Auto-Fix Generator

Configuration:
  ✅ Gemini API
  ✅ GitHub Token

============================================================
```

**Troubleshooting:**
- ❌ Port 3000 already in use:
  ```bash
  lsof -i :3000
  kill -9 <PID>
  ```

- ❌ "Cannot find module":
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

- ⚠️ "Gemini API key not found":
  - Check `.env` file exists
  - Verify `GEMINI_API_KEY` is set
  - No spaces around `=`

**Keep this terminal open!**

---

## Step 5: Start the Frontend

Open a **NEW terminal window**:

```bash
# Navigate to project directory
cd /Users/keshavkapur/Downloads/TAMU-MCP-NSDK

# Activate virtual environment if you created one
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start Streamlit
streamlit run app.py
```

**Expected output:**
```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://192.168.x.x:8501
```

The browser should open automatically. If not, visit: http://localhost:8501

---

## Step 6: Verify Installation

### Test Backend Health

Open browser or use curl:
```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "gemini": true,
  "github_token": true,
  "now": "2025-11-09T..."
}
```

### Test Frontend

1. Go to: http://localhost:8501
2. You should see **"🛠️ CodeWhisper Forge"** title
3. Try a test query:
   - **Query**: "Memory leak with Node 22 fetch"
   - **Owner**: "vercel"
   - **Repo**: "next.js"
4. Click **"⚡ Analyze with CodeWhisper Forge"**
5. Wait ~10-30 seconds
6. Should see analysis results in tabs

---

## Step 7: First Query Test

### Using the Web UI

1. In the Streamlit UI at http://localhost:8501:
   - **Query**: "Authentication fails with JWT tokens"
   - **Owner**: "supabase"
   - **Repo**: "auth"
   - Enable: ✅ **Issue Resolution Predictor (IRP)**
   - Click **"⚡ Analyze"**

2. Expected results:
   - 🤖 AI Response with recommendations
   - 🎯 Success rate predictions
   - 📦 Repository info
   - 💡 Stack Overflow solutions

### Using the API

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Memory leak with fetch",
    "repoOwner": "vercel",
    "repoName": "next.js",
    "enableIRP": true
  }'
```

---

## Common Issues & Solutions

### Backend Issues

#### "Error: Cannot find module 'dotenv'"
```bash
npm install
```

#### "Error: listen EADDRINUSE :::3000"
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 node server.js
```

#### "Gemini API key not found"
- Verify `.env` file exists in project root
- Check no spaces: `GEMINI_API_KEY=AIza...` (no spaces around `=`)
- Restart server after editing `.env`

### Frontend Issues

#### "ModuleNotFoundError: No module named 'streamlit'"
```bash
pip install -r requirements.txt
```

#### "Connection refused to localhost:3000"
- Make sure backend is running
- Check firewall settings
- Try: `http://127.0.0.1:3000/health`

#### "Matplotlib not found"
```bash
pip install matplotlib numpy
```

### API Key Issues

#### Rate limit exceeded (GitHub)
- Add `GITHUB_TOKEN` to `.env`
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

#### Gemini API errors
- Verify key is valid: https://makersuite.google.com/app/apikey
- Check quota limits
- Try a different query

---

## Advanced Setup

### Using PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
pm2 start server.js --name codewhisper-backend

# Start with environment file
pm2 start server.js --name codewhisper-backend --env .env

# View logs
pm2 logs codewhisper-backend

# Restart
pm2 restart codewhisper-backend

# Stop
pm2 stop codewhisper-backend
```

### Using Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t codewhisper-forge .
docker run -p 3000:3000 --env-file .env codewhisper-forge
```

### Custom Port Configuration

```bash
# Backend on port 4000
PORT=4000 node server.js

# Update app.py line 325:
# base_url = "http://localhost:4000"
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Google Gemini AI API key |
| `GITHUB_TOKEN` | ⚠️ Recommended | - | GitHub Personal Access Token |
| `HF_TOKEN` | ❌ No | - | Hugging Face API token |
| `PORT` | ❌ No | 3000 | Backend server port |

---

## Next Steps

✅ **Setup Complete!** Now you can:

1. 📖 Read the main [README.md](README.md) for usage examples
2. 🔍 Try different queries and repositories
3. 🎯 Enable/disable IRP and AFG features
4. 📊 Analyze the prediction success rates
5. 🤖 Test the Auto-Fix Generator (dry-run mode)

---

## Getting Help

If you encounter issues:

1. ✅ Check this setup guide
2. ✅ Review [README.md](README.md) troubleshooting section
3. ✅ Verify all environment variables are set
4. ✅ Check terminal logs for error messages
5. ✅ Test `/health` endpoint

---

**Happy Coding! 🚀**

