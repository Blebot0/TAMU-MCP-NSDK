# 📡 CodeWhisper Forge - API Documentation

Complete API reference for the CodeWhisper Forge backend.

---

## Base URL

```
http://localhost:3000
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check server status and configuration.

#### Response

```json
{
  "status": "healthy",
  "gemini": true,
  "github_token": true,
  "hf_token": false,
  "now": "2025-11-09T12:00:00.000Z"
}
```

#### Status Codes
- `200 OK` - Server is running

---

### 2. Analyze Issue (Main MCP Endpoint)

**POST** `/mcp`

Analyze a code issue with AI-powered context and predictions.

#### Request Body

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

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | - | The issue/question to analyze |
| `repoOwner` | string | ✅ Yes | - | GitHub repository owner/org |
| `repoName` | string | ✅ Yes | - | GitHub repository name |
| `enableIRP` | boolean | ❌ No | `true` | Enable Issue Resolution Predictor |
| `enableAFG` | object/boolean | ❌ No | `false` | Enable Auto-Fix Generator |
| `enableAFG.dryRun` | boolean | ❌ No | `true` | AFG dry-run mode |
| `enableAFG.base` | string | ❌ No | `"main"` | Base branch for PR |

#### Response

```json
{
  "success": true,
  "query": "Memory leak with Node 22 fetch",
  "analysis": {
    "intent": "performance",
    "keywords": ["memory", "leak", "fetch"],
    "tech_stack": ["node", "fetch"],
    "search_terms": "memory leak node fetch",
    "severity": "high"
  },
  "context": {
    "markdown": "## 📊 Query Analysis\n...",
    "github": {
      "repo_info": {
        "name": "vercel/next.js",
        "description": "The React Framework",
        "stars": 123000,
        "language": "TypeScript",
        "open_issues": 1234,
        "default_branch": "canary"
      },
      "issues": [
        {
          "number": 12345,
          "title": "Memory leak in development mode",
          "state": "open",
          "labels": ["bug", "performance"],
          "url": "https://github.com/vercel/next.js/issues/12345",
          "created_at": "2025-10-15T10:30:00Z",
          "comments": 15
        }
      ],
      "commits": [
        {
          "sha": "a1b2c3d",
          "full_sha": "a1b2c3d4e5f6...",
          "message": "Fix memory leak in fetch handler",
          "full_message": "Fix memory leak...\n\nDetails...",
          "author": "John Doe",
          "date": "2025-11-01T14:22:00Z",
          "url": "https://github.com/vercel/next.js/commit/a1b2c3d"
        }
      ],
      "trending": [
        {
          "name": "node/node",
          "stars": 98000,
          "description": "Node.js JavaScript runtime",
          "language": "JavaScript",
          "url": "https://github.com/nodejs/node"
        }
      ]
    },
    "stackoverflow": [
      {
        "title": "How to prevent memory leaks in Node.js fetch",
        "score": 125,
        "link": "https://stackoverflow.com/questions/...",
        "answered": true,
        "answer_count": 8,
        "tags": ["node.js", "fetch", "memory-leak"]
      }
    ]
  },
  "predictions": {
    "predictions": [
      {
        "label": "UPGRADE DEPENDENCY",
        "success_count": 12,
        "failure_count": 2,
        "trials": 5,
        "success_rate": 0.857,
        "confidence": "high",
        "evidence": [
          {
            "issue": 11234,
            "link": "https://github.com/vercel/next.js/issues/11234",
            "title": "Memory leak fixed by upgrading"
          }
        ]
      }
    ],
    "total_issues_analyzed": 15,
    "confidence": "high",
    "message": "Analyzed 15 similar closed issues"
  },
  "prPlan": {
    "applied": false,
    "dryRun": true,
    "changes": [
      {
        "path": "src/utils/fetch.js",
        "action": "modify",
        "content_b64": "Y29uc3QgZmV0Y2ggPSAuLi4=",
        "additions": 10,
        "deletions": 2,
        "bytes": 1234,
        "reason": "Add AbortController to prevent memory leak"
      }
    ],
    "message": "Dry-run: Would modify 1 files"
  },
  "ai_response": "## 🎯 Root Cause Analysis\n\nThe memory leak...",
  "metadata": {
    "timestamp": "2025-11-09T12:00:00.000Z",
    "processing_time_ms": 2543,
    "using_gemini": true,
    "using_github_token": true,
    "features": {
      "irp": true,
      "afg": true
    }
  }
}
```

#### Status Codes
- `200 OK` - Request successful
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Processing error

#### Example Requests

##### Basic Query
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Authentication timeout",
    "repoOwner": "supabase",
    "repoName": "auth"
  }'
```

##### With IRP Enabled
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Build fails with webpack 5",
    "repoOwner": "webpack",
    "repoName": "webpack",
    "enableIRP": true
  }'
```

##### With AFG (Dry Run)
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "query": "React hydration mismatch",
    "repoOwner": "facebook",
    "repoName": "react",
    "enableIRP": true,
    "enableAFG": {
      "dryRun": true,
      "base": "main"
    }
  }'
```

---

## Data Models

### Analysis Object

```typescript
interface Analysis {
  intent: "fix" | "optimize" | "debug" | "implement" | "understand" | "general";
  keywords: string[];
  tech_stack: string[];
  search_terms: string;
  severity: "critical" | "high" | "medium" | "low";
}
```

### GitHub Context

```typescript
interface GitHubContext {
  repo_info: {
    name: string;
    description: string;
    stars: number;
    language: string;
    open_issues: number;
    default_branch: string;
  };
  issues: Issue[];
  commits: Commit[];
  trending: Repository[];
}

interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  url: string;
  created_at: string;
  comments: number;
}

interface Commit {
  sha: string;
  full_sha: string;
  message: string;
  full_message: string;
  author: string;
  date: string;
  url: string;
}
```

### Predictions Object

```typescript
interface Predictions {
  predictions: Prediction[];
  total_issues_analyzed: number;
  confidence: "high" | "medium" | "low";
  message: string;
}

interface Prediction {
  label: string;
  success_count: number;
  failure_count: number;
  trials: number;
  success_rate: number;  // 0.0 to 1.0
  confidence: "high" | "medium" | "low";
  evidence: Evidence[];
}

interface Evidence {
  issue: number;
  link: string;
  title: string;
}
```

### PR Plan Object

```typescript
interface PRPlan {
  applied: boolean;
  dryRun: boolean;
  branch?: string;
  base?: string;
  changes: FileChange[];
  message: string;
  prUrl?: string;
  reason?: string;
  error?: string;
}

interface FileChange {
  path: string;
  action: "modify" | "create" | "delete";
  content_b64: string;
  additions: number;
  deletions: number;
  bytes: number;
  reason: string;
}
```

---

## Rate Limits

### Without GitHub Token
- **60 requests/hour** to GitHub API
- Shared across all users on the same IP

### With GitHub Token
- **5,000 requests/hour** to GitHub API
- Per-token limit

### Gemini AI
- Depends on your API key tier
- Check: https://ai.google.dev/pricing

---

## Error Responses

### Missing Required Fields

```json
{
  "error": "Missing required fields",
  "required": ["query", "repoOwner", "repoName"]
}
```

### Internal Server Error

```json
{
  "success": false,
  "error": "GitHub API rate limit exceeded"
}
```

---

## Response Time

Typical response times:

| Configuration | Time |
|--------------|------|
| Basic query (no IRP, no AFG) | 2-5 seconds |
| With IRP | 5-15 seconds |
| With IRP + AFG (dry-run) | 10-30 seconds |
| With IRP + AFG (live) | 15-45 seconds |

Factors affecting performance:
- GitHub API response time
- Number of issues analyzed
- AI model response time
- Network latency

---

## Best Practices

### 1. Use Specific Queries
✅ Good: "Memory leak when using Node 22 fetch with AbortController"
❌ Bad: "My app is slow"

### 2. Enable IRP for Complex Issues
- Use IRP for known/common problems
- Skip IRP for quick lookups

### 3. Always Test AFG in Dry-Run First
```json
{
  "enableAFG": {
    "dryRun": true
  }
}
```

### 4. Cache Responses Client-Side
- Response includes `timestamp` in metadata
- Cache for 5-10 minutes for same query

### 5. Handle Errors Gracefully
```javascript
try {
  const response = await fetch('/mcp', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    console.error('Analysis failed:', data.error);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## Webhook Integration (Future)

Coming soon: Webhook support for async processing

```json
{
  "query": "...",
  "repoOwner": "...",
  "repoName": "...",
  "webhookUrl": "https://your-app.com/webhook",
  "async": true
}
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function analyzeIssue(query, owner, repo) {
  try {
    const response = await axios.post('http://localhost:3000/mcp', {
      query,
      repoOwner: owner,
      repoName: repo,
      enableIRP: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
analyzeIssue('Memory leak with fetch', 'vercel', 'next.js')
  .then(result => console.log(result.ai_response))
  .catch(err => console.error(err));
```

### Python

```python
import requests

def analyze_issue(query: str, owner: str, repo: str) -> dict:
    url = "http://localhost:3000/mcp"
    payload = {
        "query": query,
        "repoOwner": owner,
        "repoName": repo,
        "enableIRP": True
    }
    
    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    
    return response.json()

# Usage
result = analyze_issue("Memory leak with fetch", "vercel", "next.js")
print(result["ai_response"])
```

### cURL

```bash
#!/bin/bash

QUERY="Memory leak with fetch"
OWNER="vercel"
REPO="next.js"

curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"$QUERY\",
    \"repoOwner\": \"$OWNER\",
    \"repoName\": \"$REPO\",
    \"enableIRP\": true
  }" | jq '.ai_response'
```

---

## Changelog

### v9 (Current)
- ✅ Issue Resolution Predictor (IRP)
- ✅ Auto-Fix Generator (AFG)
- ✅ Success rate analysis
- ✅ Evidence-based recommendations

### v8
- Smart query analysis with Gemini
- GitHub context fetching
- Stack Overflow integration

---

**Need help?** Check the [README.md](README.md) or [SETUP.md](SETUP.md)

