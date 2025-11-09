# 🤝 Contributing to CodeWhisper Forge

Thank you for your interest in contributing to CodeWhisper Forge! This document provides guidelines and instructions for contributing.

---

## 🌟 Ways to Contribute

1. **Report Bugs** - Found an issue? Let us know!
2. **Suggest Features** - Have an idea? Share it!
3. **Improve Documentation** - Help make our docs better
4. **Submit Code** - Fix bugs or add features
5. **Write Tests** - Help improve code quality

---

## 🐛 Reporting Bugs

Before reporting a bug:
- Check if it's already reported in Issues
- Verify you're using the latest version
- Test with minimal configuration

**Bug Report Template:**
```markdown
**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Start server with...
2. Send request with...
3. Observe...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Node.js version: 
- Python version:
- OS:
- Browser (if UI issue):

**Logs:**
```
Paste relevant logs here
```

**Screenshots:**
If applicable
```

---

## 💡 Suggesting Features

Feature suggestions are welcome! Please include:

1. **Use Case** - Why is this needed?
2. **Proposed Solution** - How should it work?
3. **Alternatives** - Other ways to solve it?
4. **Additional Context** - Any other info

---

## 🚀 Development Setup

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/TAMU-MCP-NSDK.git
cd TAMU-MCP-NSDK
```

### 2. Install Dependencies

```bash
# Node.js
npm install

# Python
pip install -r requirements.txt
```

### 3. Create .env

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Create Branch

```bash
git checkout -b feature/your-feature-name
```

---

## 📝 Coding Standards

### JavaScript/Node.js (server.js)

```javascript
// Use clear, descriptive names
async function fetchGitHubContext(analysis, owner, name) {
  // ... implementation
}

// Add comments for complex logic
// Filter relevant issues based on keywords
const relevantIssues = issues.data.filter(issue => {
  // ...
});

// Use try-catch for async operations
try {
  const response = await someAsyncFunction();
} catch (error) {
  console.error('❌ Error description:', error.message);
}
```

### Python (app.py)

```python
# Use type hints
def render_predictions(pred: Optional[Dict[str, Any]]) -> None:
    """Render Issue Resolution Predictions"""
    if not pred:
        return
    # ... implementation

# Follow PEP 8 style guide
# Use docstrings for functions
# Keep functions focused and small
```

### Formatting

- **JavaScript**: 2 spaces for indentation
- **Python**: 4 spaces for indentation (PEP 8)
- No trailing whitespace
- Empty line at end of file

---

## 🧪 Testing

### Manual Testing

Before submitting:

1. **Test Backend**
   ```bash
   node server.js
   curl http://localhost:3000/health
   ```

2. **Test Frontend**
   ```bash
   streamlit run app.py
   # Try different queries
   ```

3. **Test Features**
   - ✅ Query analysis works
   - ✅ GitHub API integration
   - ✅ Stack Overflow integration
   - ✅ IRP predictions
   - ✅ AFG fix generation

### Future: Automated Tests

We plan to add:
- Unit tests
- Integration tests
- End-to-end tests

---

## 📤 Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "feat: Add support for GitLab repositories"
git commit -m "fix: Resolve memory leak in GitHub API client"
git commit -m "docs: Update API documentation with new endpoints"

# Avoid
git commit -m "fix stuff"
git commit -m "updates"
```

### Commit Message Format

```
<type>: <short summary>

<optional detailed description>

<optional footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

### Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Update API.md for API changes
   - Add comments in code

2. **Test Thoroughly**
   - Test all affected features
   - Test edge cases
   - Test error handling

3. **Create Pull Request**
   ```markdown
   **Description:**
   Brief description of changes
   
   **Changes:**
   - Added X feature
   - Fixed Y bug
   - Updated Z documentation
   
   **Testing:**
   - Tested scenario A
   - Tested scenario B
   
   **Screenshots:**
   If applicable
   ```

4. **Respond to Feedback**
   - Address review comments
   - Make requested changes
   - Be patient and respectful

---

## 🏗️ Project Structure

```
TAMU-MCP-NSDK/
├── server.js              # Backend API
│   ├── Query Analysis
│   ├── GitHub Integration
│   ├── Stack Overflow
│   ├── Issue Resolution Predictor
│   └── Auto-Fix Generator
│
├── app.py                 # Frontend UI
│   ├── Streamlit Interface
│   ├── Result Rendering
│   └── Visualization
│
├── package.json           # Node.js config
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
│
└── Documentation
    ├── README.md         # Main docs
    ├── SETUP.md          # Setup guide
    ├── API.md            # API reference
    └── CONTRIBUTING.md   # This file
```

---

## 🎯 Areas Needing Help

### High Priority
- [ ] Add unit tests for core functions
- [ ] Implement GitLab support
- [ ] Add response caching layer
- [ ] Improve error handling

### Medium Priority
- [ ] Add more AI model options
- [ ] Support for Bitbucket
- [ ] Export results to PDF
- [ ] Custom solution pattern training

### Low Priority
- [ ] Dark mode for UI
- [ ] Keyboard shortcuts
- [ ] Multi-language support
- [ ] Mobile-responsive UI

---

## 🛠️ Technical Details

### Backend Architecture

```javascript
// Request flow
POST /mcp
  → smartAnalyze(query)              // AI-powered analysis
  → fetchGitHubContext()             // Get repo data
  → analyzeResolutionProbability()   // IRP
  → generateAutoFix()                // AFG (optional)
  → generateAIResponse()             // Final response
  → return JSON
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `smartAnalyze()` | Extract intent, keywords, tech stack |
| `fetchGitHubContext()` | Get issues, commits, repo info |
| `analyzeResolutionProbability()` | Calculate success rates |
| `generateAutoFix()` | Create PR-ready fixes |
| `formatContext()` | Prepare markdown output |

### Frontend Components

| Component | Purpose |
|-----------|---------|
| `render_predictions()` | Show IRP results |
| `render_pr_plan()` | Show AFG output |
| `render_analysis()` | Display query analysis |
| `build_zip_from_changes()` | Package file changes |

---

## 🔒 Security Guidelines

1. **Never commit secrets**
   - No API keys in code
   - Use environment variables
   - Check .gitignore

2. **Validate inputs**
   - Sanitize user queries
   - Validate repo names
   - Check parameter types

3. **Handle errors safely**
   - Don't expose internal errors
   - Log securely
   - Use try-catch blocks

4. **API rate limits**
   - Respect rate limits
   - Implement exponential backoff
   - Cache when possible

---

## 📚 Resources

- **Gemini API**: https://ai.google.dev/docs
- **GitHub API**: https://docs.github.com/rest
- **Stack Overflow API**: https://api.stackexchange.com/docs
- **Streamlit**: https://docs.streamlit.io
- **Express.js**: https://expressjs.com/

---

## 🎨 Design Philosophy

### Code Quality
- **Clear over clever** - Readable code > Clever code
- **Simple over complex** - KISS principle
- **Tested over assumed** - Test edge cases
- **Documented over obvious** - When in doubt, comment

### User Experience
- **Fast feedback** - Show progress indicators
- **Clear errors** - Helpful error messages
- **Sensible defaults** - Work out of the box
- **Flexible options** - Allow customization

---

## ❓ Questions?

- Check existing Issues and Discussions
- Read documentation thoroughly
- Ask in GitHub Discussions
- Contact maintainers

---

## 📜 Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with respect
- **Be collaborative** - Work together
- **Be constructive** - Provide helpful feedback
- **Be inclusive** - Welcome diverse perspectives

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information
- Unprofessional conduct

---

## 🏆 Contributors

Thanks to all contributors! Your contributions make this project better.

<!-- Add your name when you contribute! -->

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

**Thank you for contributing to CodeWhisper Forge! 🚀**

