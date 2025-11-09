# 🛠️ CodeWhisper Forge

**AI-Powered Issue Resolution with Success Rate Prediction**

CodeWhisper Forge is an intelligent developer assistant that analyzes code issues, predicts solution success rates based on historical data, and can automatically generate fixes. Built with Node.js and Python, it combines multiple AI models and data sources to provide comprehensive issue resolution guidance.

---

## ✨ Features

### 🎯 Issue Resolution Predictor (IRP)
- Analyzes similar closed GitHub issues
- Calculates success rates for different solution approaches
- Provides evidence-based recommendations with confidence scores

### 🤖 Auto-Fix Generator (AFG)
- Automatically generates code fixes using AI
- Creates pull-ready file changes
- Supports dry-run mode for testing

### 🔍 Smart Query Analysis
- Uses Google Gemini AI for intelligent query understanding
- Extracts keywords, tech stack, and severity automatically
- Enhanced fallback system when AI is unavailable

### 🌐 Multi-Source Context
- **GitHub Integration**: Issues, commits, repository info, trending repos
- **Stack Overflow**: Relevant Q&A with voting scores
- **AI-Enhanced Responses**: Comprehensive solutions with code examples

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Streamlit UI   │  (Python - app.py)
│   Port: 8501    │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│  Express API    │  (Node.js - server.js)
│   Port: 3000    │
└────────┬────────┘
         │
         ├──► 🤖 Gemini AI (Query Analysis + Fix Generation)
         ├──► 🐙 GitHub API (Issues, Commits, Repos)
         ├──► 💡 Stack Overflow API (Q&A Search)
         └──► 🧠 Hugging Face (Optional)
```

---

## 📋 Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.8
- **npm** or **yarn**
- **pip** (Python package manager)

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd TAMU-MCP-NSDK
```

### 2️⃣ Install Backend Dependencies

```bash
npm install
```

### 3️⃣ Install Frontend Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Required for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional but recommended
GITHUB_TOKEN=your_github_personal_access_token

# Optional
HF_TOKEN=your_huggingface_token
PORT=3000
```

### 5️⃣ Start the Backend Server

```bash
node server.js
```

You should see:
```
🔥 CodeWhisper Forge v9 - WINNING EDITION
📡 Server: http://localhost:3000
✨ Features: Issue Resolution Predictor + Auto-Fix Generator
```

### 6️⃣ Start the Frontend UI

In a **new terminal window**:

```bash
streamlit run app.py
```

The UI will open automatically at `http://localhost:8501`

---

## 🔑 Getting API Keys

### Gemini API Key (Required for AI features)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### GitHub Token (Optional but recommended)

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`, `read:org`
4. Generate and copy the token
5. Add it to your `.env` file

**Note**: Without a GitHub token, you'll be limited to 60 API requests per hour.

### Hugging Face Token (Optional)

1. Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Add it to your `.env` file

---

## 📖 Usage

### Web Interface (Recommended)

1. Open `http://localhost:8501` in your browser
2. Enter your query (e.g., "Memory leak with Node 22 fetch")
3. Specify the GitHub repository (Owner + Name)
4. Enable features:
   - ✅ **IRP**: Issue Resolution Predictor
   - 🤖 **AFG**: Auto-Fix Generator
5. Click "⚡ Analyze with CodeWhisper Forge"

### API Endpoint

**POST** `http://localhost:3000/mcp`

**Request Body:**
```json
{
  "query": "Memory leak with Node 22 fetch",
  "repoOwner": "vercel",
  "repoName": "next.js",
  "enableIRP": true,
  "enableAFG": {
    "dryRun": true,
    "base": "main"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": { ... },
  "context": { ... },
  "predictions": { ... },
  "prPlan": { ... },
  "ai_response": "...",
  "metadata": { ... }
}
```

### Health Check

**GET** `http://localhost:3000/health`

```json
{
  "status": "healthy",
  "gemini": true,
  "github_token": true,
  "now": "2025-11-09T12:00:00.000Z"
}
```

---

## 🎨 Example Queries

| Query | Repository | Expected Results |
|-------|-----------|------------------|
| "Memory leak with Node 22 fetch" | `vercel/next.js` | Performance analysis, memory optimization tips |
| "Authentication fails with OAuth" | `supabase/auth` | Auth-related issues, JWT solutions |
| "Build error with webpack 5" | `webpack/webpack` | Build configuration fixes |
| "React hydration mismatch" | `facebook/react` | SSR/hydration solutions |

---

## 📁 Project Structure

```
TAMU-MCP-NSDK/
├── server.js              # Node.js Express backend
├── app.py                 # Python Streamlit frontend
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

---

## 🔧 Configuration

### Backend (server.js)

- **Port**: Set via `PORT` env variable (default: 3000)
- **Cache TTL**: 300 seconds (5 minutes)
- **Timeouts**: 
  - GitHub API: 10 seconds
  - Stack Overflow: 10 seconds
  - AI generation: 60 seconds

### Frontend (app.py)

- **Base URL**: Hardcoded to `http://localhost:3000`
- **Request Timeout**: 90 seconds
- **Layout**: Wide mode, expanded sidebar

---

## 🧪 Features Deep Dive

### Issue Resolution Predictor (IRP)

Analyzes up to 30 similar closed issues to identify successful solution patterns:

1. **Success Indicators**: "this worked", "fixed it", "solved", "resolved"
2. **Failure Indicators**: "didn't work", "still broken", "same issue"
3. **Solution Types**:
   - Upgrade dependency
   - Downgrade dependency
   - Configuration change
   - Code fix
   - Workaround

4. **Confidence Levels**:
   - **High**: 3+ similar cases
   - **Medium**: 2 similar cases
   - **Low**: 1 or fewer cases

### Auto-Fix Generator (AFG)

Generates code fixes using AI:

1. **Dry Run Mode** (default): Shows proposed changes without creating PR
2. **Live Mode**: Creates actual GitHub branch and PR (requires `GITHUB_TOKEN`)
3. **Output**: Base64-encoded file contents, line counts, change reasons

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

### "Gemini API Not Configured"

- Verify `GEMINI_API_KEY` in `.env`
- Restart the server: `node server.js`

### "GitHub API rate limit exceeded"

- Add `GITHUB_TOKEN` to `.env` to increase limit from 60 to 5000 requests/hour
- Wait an hour for rate limit to reset

### Frontend can't connect to backend

- Ensure backend is running on port 3000
- Check firewall settings
- Try `http://127.0.0.1:3000/health` in browser

### Python dependencies installation fails

```bash
# Upgrade pip first
pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v
```

---

## 🔒 Security Notes

- **Never commit** `.env` file to version control
- Use environment variables for all sensitive data
- GitHub tokens should have minimal required scopes
- Regularly rotate API keys
- Review Auto-Fix Generator changes before applying

---

## 🚀 Performance Tips

1. **Enable GitHub Token**: Increases API limits significantly
2. **Use IRP Selectively**: Disable for simple queries to speed up response
3. **Cache Results**: Backend uses 5-minute cache for repeated queries
4. **Optimize Queries**: Be specific to get better, faster results

---

## 🤝 Contributing

This project was built for the TAMU Hackathon. Contributions are welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📝 License

ISC License - See `package.json` for details.

---

## 🙏 Acknowledgments

- **Google Gemini**: AI-powered query analysis
- **GitHub API**: Repository and issue data
- **Stack Overflow API**: Community solutions
- **Streamlit**: Beautiful Python UI framework
- **Express.js**: Fast Node.js web framework

---

## 📞 Support

For issues, questions, or feedback:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review API key configuration
3. Open an issue on GitHub

---

## 🎯 Roadmap

- [ ] Support for more AI models (Claude, GPT-4)
- [ ] GitLab and Bitbucket integration
- [ ] Custom solution pattern training
- [ ] Real-time collaboration features
- [ ] Browser extension
- [ ] VS Code extension

---

**Built with ❤️ for developers, by developers**

