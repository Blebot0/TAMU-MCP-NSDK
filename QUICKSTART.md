# ⚡ CodeWhisper Forge - Quick Start

Get up and running in 5 minutes!

---

## 🚀 Fast Track Setup

### 1. Install Dependencies (2 min)

```bash
# Node.js dependencies
npm install

# Python dependencies
pip install -r requirements.txt
```

### 2. Configure API Key (1 min)

```bash
# Copy environment template
cp .env.example .env

# Add your Gemini API key
echo "GEMINI_API_KEY=YOUR_KEY_HERE" >> .env
```

**Get Gemini API key**: https://makersuite.google.com/app/apikey

### 3. Start Everything (1 min)

**Option A: Automated (Recommended)**
```bash
./start.sh
```

**Option B: Manual**
```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
streamlit run app.py
```

### 4. Open Browser

Visit: **http://localhost:8501**

---

## 🎯 First Query

Try this example:

1. **Query**: `Memory leak with Node 22 fetch`
2. **Owner**: `vercel`
3. **Repo**: `next.js`
4. Enable: ✅ **Issue Resolution Predictor**
5. Click: **"⚡ Analyze"**

---

## 📋 Common Commands

```bash
# Health check
curl http://localhost:3000/health

# Example API request
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"query":"auth timeout","repoOwner":"supabase","repoName":"auth"}'

# Stop servers (if using start.sh)
Ctrl+C
```

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` |
| "Module not found" | `npm install` |
| "GEMINI_API_KEY missing" | Add key to `.env` file |
| Can't connect to backend | Ensure backend is running on port 3000 |

---

## 📖 More Information

- **Full Documentation**: [README.md](README.md)
- **Detailed Setup**: [SETUP.md](SETUP.md)
- **API Reference**: [API.md](API.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🎉 You're Ready!

Start analyzing issues with AI-powered predictions! 🚀

