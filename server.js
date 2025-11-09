// server.js — CodeWhisper Forge v9 — WINNING EDITION
// Features: Issue Resolution Predictor + Auto-Fix Generator
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const { HfInference } = require('@huggingface/inference');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

const app = express();
app.use(express.json());

// Initialize Gemini AI client
let aiClient = null;
try {
  aiClient = new GoogleGenAI({});
  console.log('✅ Gemini AI client initialized');
} catch (e) {
  console.log('⚠️  Gemini API key not found. Set GEMINI_API_KEY in .env');
}

// ============================================
// STAGE 1: SMART QUERY ANALYSIS
// ============================================
async function smartAnalyze(query) {
  const prompt = `Analyze this developer query and return ONLY valid JSON (no markdown):

Query: "${query}"

Return format:
{
  "intent": "fix|optimize|debug|implement|understand",
  "keywords": ["keyword1", "keyword2"],
  "tech_stack": ["technology1", "technology2"],
  "search_terms": "optimized github search query",
  "severity": "critical|high|medium|low"
}`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });
      
      const text = response.text;
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      console.log('✅ Gemini analysis successful');
      return parsed;
    } catch (e) {
      console.error('❌ Gemini analysis failed:', e.message);
    }
  }

  // Enhanced fallback
  console.log('⚠️  Using fallback keyword extraction');
  const query_lower = query.toLowerCase();
  
  const patterns = {
    auth: /auth|login|signup|password|token|jwt|session|oauth|credentials/,
    performance: /slow|lag|timeout|performance|optimize|speed|bottleneck|latency/,
    bugs: /bug|error|crash|fail|break|issue|exception|throw/,
    memory: /memory|leak|heap|garbage|allocation/,
    frontend: /react|vue|angular|next|svelte|ui|component|css|html|dom/,
    backend: /api|server|database|query|endpoint|route|middleware|express/,
    build: /build|compile|webpack|turbopack|vite|bundle|deploy|bundler/,
    testing: /test|testing|jest|cypress|playwright|unit|integration/,
    database: /sql|postgres|mysql|mongodb|redis|prisma|orm|query/
  };
  
  const keywords = [];
  const tech_stack = [];
  
  for (const [category, regex] of Object.entries(patterns)) {
    if (regex.test(query_lower)) {
      keywords.push(category);
      const matches = query_lower.match(regex);
      if (matches) {
        tech_stack.push(...matches);
      }
    }
  }
  
  const searchTerms = query_lower
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !['this', 'that', 'with', 'from'].includes(word))
    .join(' ');
  
  return {
    intent: keywords.length > 0 ? keywords[0] : "general",
    keywords: [...new Set(tech_stack)].slice(0, 5),
    tech_stack: [...new Set(tech_stack)],
    search_terms: searchTerms || query_lower,
    severity: keywords.includes('crash') || keywords.includes('critical') ? 'high' : 'medium'
  };
}

// ============================================
// STAGE 2: GITHUB CONTEXT FETCHING
// ============================================
async function fetchGitHubContext(analysis, owner, name) {
  const headers = process.env.GITHUB_TOKEN ? 
    { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
  
  const timeout = 10000;
  
  try {
    console.log(`🔍 Fetching GitHub context for ${owner}/${name}...`);
    
    const [issues, commits, search, repo] = await Promise.all([
      axios.get(
        `https://api.github.com/repos/${owner}/${name}/issues?state=open&per_page=15`, 
        { headers, timeout }
      ).catch(err => {
        console.error('⚠️  GitHub issues fetch failed:', err.response?.status || err.message);
        return { data: [] };
      }),
      
      axios.get(
        `https://api.github.com/repos/${owner}/${name}/commits?per_page=50`, 
        { headers, timeout }
      ).catch(err => {
        console.error('⚠️  GitHub commits fetch failed:', err.response?.status || err.message);
        return { data: [] };
      }),
      
      axios.get(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(analysis.search_terms + ' stars:>50')}&sort=stars&per_page=5`, 
        { headers, timeout }
      ).catch(err => {
        console.error('⚠️  GitHub search failed:', err.response?.status || err.message);
        return { data: { items: [] } };
      }),
      
      axios.get(
        `https://api.github.com/repos/${owner}/${name}`, 
        { headers, timeout }
      ).catch(err => {
        console.error('⚠️  GitHub repo info failed:', err.response?.status || err.message);
        return { data: {} };
      })
    ]);

    // Filter relevant issues
    const relevantIssues = issues.data
      .filter(issue => 
        !issue.pull_request &&
        analysis.keywords.some(keyword => 
          issue.title.toLowerCase().includes(keyword.toLowerCase()) ||
          (issue.body && issue.body.toLowerCase().includes(keyword.toLowerCase()))
        )
      )
      .slice(0, 5)
      .map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        labels: i.labels.map(l => l.name),
        url: i.html_url,
        created_at: i.created_at,
        comments: i.comments
      }));

    // Filter relevant commits
    const allCommits = commits.data.map(c => ({
      sha: c.sha.substring(0, 7),
      full_sha: c.sha,
      message: c.commit.message.split('\n')[0],
      full_message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
      url: c.html_url
    }));

    const relevantCommits = allCommits.filter(commit => {
      const searchText = (commit.message + ' ' + commit.full_message).toLowerCase();
      return analysis.keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });

    const recentCommits = relevantCommits.length > 0 
      ? relevantCommits.slice(0, 8)
      : allCommits.slice(0, 8);

    const trendingRepos = search.data.items
      .slice(0, 5)
      .map(r => ({
        name: r.full_name,
        stars: r.stargazers_count,
        description: r.description?.substring(0, 150),
        language: r.language,
        url: r.html_url
      }));

    return {
      repo_info: {
        name: repo.data.full_name,
        description: repo.data.description,
        stars: repo.data.stargazers_count,
        language: repo.data.language,
        open_issues: repo.data.open_issues_count,
        default_branch: repo.data.default_branch
      },
      issues: relevantIssues,
      commits: recentCommits,
      trending: trendingRepos
    };
  } catch (e) {
    console.error('❌ GitHub context fetch error:', e.message);
    return { repo_info: {}, issues: [], commits: [], trending: [] };
  }
}

// ============================================
// 🔥 NEW: ISSUE RESOLUTION PREDICTOR (IRP)
// ============================================
async function analyzeResolutionProbability(analysis, owner, name) {
  const headers = process.env.GITHUB_TOKEN ? 
    { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
  
  try {
    console.log('🎯 Running Issue Resolution Predictor...');
    
    // Search for CLOSED issues with similar keywords
    const closedSearch = await axios.get(
      `https://api.github.com/search/issues?q=${encodeURIComponent(
        `${analysis.search_terms} repo:${owner}/${name} is:closed is:issue`
      )}&per_page=30&sort=comments`,
      { headers, timeout: 15000 }
    );
    
    const closedIssues = closedSearch.data.items || [];
    console.log(`   Found ${closedIssues.length} closed issues for analysis`);
    
    if (closedIssues.length === 0) {
      return {
        predictions: [],
        confidence: 'low',
        message: 'No similar closed issues found for prediction'
      };
    }

    // Analyze solutions from closed issues
    const solutionAnalysis = await Promise.all(
      closedIssues.slice(0, 15).map(async (issue) => {
        try {
          // Fetch comments for each issue
          const commentsResponse = await axios.get(
            issue.comments_url,
            { headers, timeout: 8000 }
          );
          
          const comments = commentsResponse.data || [];
          
          // Success indicators
          const successPhrases = [
            'this worked', 'fixed it', 'solved', 'resolved', 'working now',
            'thank you', 'thanks!', 'perfect', 'that did it', 'success'
          ];
          
          // Failure indicators
          const failurePhrases = [
            'didn\'t work', 'still broken', 'not working', 'same issue',
            'didn\'t fix', 'still happening', 'no luck'
          ];
          
          // Extract solutions (code blocks or substantial comments)
          const solutions = comments
            .filter(c => c.body && (c.body.includes('```') || c.body.length > 100))
            .slice(0, 5);
          
          // Count feedback
          const allText = comments.map(c => c.body?.toLowerCase() || '').join(' ');
          
          const successCount = successPhrases.filter(phrase => 
            allText.includes(phrase)
          ).length;
          
          const failureCount = failurePhrases.filter(phrase => 
            allText.includes(phrase)
          ).length;
          
          return {
            issue_number: issue.number,
            title: issue.title,
            url: issue.html_url,
            solutions: solutions.map(s => ({
              author: s.user.login,
              body: s.body.substring(0, 500),
              created_at: s.created_at
            })),
            success_indicators: successCount,
            failure_indicators: failureCount,
            total_comments: comments.length,
            labels: issue.labels.map(l => l.name)
          };
        } catch (e) {
          console.error(`   Failed to analyze issue #${issue.number}`);
          return null;
        }
      })
    );
    
    // Filter valid results
    const validAnalysis = solutionAnalysis.filter(a => a !== null);
    
    // Group solutions by approach
    const solutionGroups = {};
    
    for (const analysis of validAnalysis) {
      for (const solution of analysis.solutions) {
        // Extract solution type from text
        const text = solution.body.toLowerCase();
        let solutionType = 'general_fix';
        
        if (text.includes('upgrade') || text.includes('update')) solutionType = 'upgrade_dependency';
        else if (text.includes('downgrade')) solutionType = 'downgrade_dependency';
        else if (text.includes('config') || text.includes('setting')) solutionType = 'configuration_change';
        else if (text.includes('workaround') || text.includes('hack')) solutionType = 'workaround';
        else if (text.includes('```')) solutionType = 'code_fix';
        
        if (!solutionGroups[solutionType]) {
          solutionGroups[solutionType] = {
            label: solutionType,
            success_count: 0,
            failure_count: 0,
            trials: 0,
            evidence: []
          };
        }
        
        solutionGroups[solutionType].success_count += analysis.success_indicators;
        solutionGroups[solutionType].failure_count += analysis.failure_indicators;
        solutionGroups[solutionType].trials += 1;
        solutionGroups[solutionType].evidence.push({
          issue: analysis.issue_number,
          link: analysis.url,
          title: analysis.title
        });
      }
    }
    
    // Calculate success rates
    const predictions = Object.values(solutionGroups)
      .map(group => ({
        label: group.label.replace(/_/g, ' ').toUpperCase(),
        success_count: group.success_count,
        failure_count: group.failure_count,
        trials: group.trials,
        success_rate: group.success_count + group.failure_count > 0
          ? group.success_count / (group.success_count + group.failure_count)
          : 0.5,
        confidence: group.trials > 3 ? 'high' : group.trials > 1 ? 'medium' : 'low',
        evidence: group.evidence.slice(0, 3)
      }))
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 5);
    
    console.log(`   ✓ Generated ${predictions.length} solution predictions`);
    
    return {
      predictions,
      total_issues_analyzed: validAnalysis.length,
      confidence: predictions.length > 0 && predictions[0].trials > 3 ? 'high' : 'medium',
      message: `Analyzed ${validAnalysis.length} similar closed issues`
    };
    
  } catch (e) {
    console.error('❌ Resolution prediction failed:', e.message);
    return {
      predictions: [],
      confidence: 'low',
      error: e.message
    };
  }
}

// ============================================
// 🔥 NEW: AUTO-FIX GENERATOR (AFG)
// ============================================
async function generateAutoFix(analysis, predictions, owner, name, options = {}) {
  const { dryRun = true, base = 'main' } = options;
  const headers = process.env.GITHUB_TOKEN ? 
    { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
  
  if (!process.env.GITHUB_TOKEN) {
    return {
      applied: false,
      reason: 'GITHUB_TOKEN missing',
      message: 'Cannot create PR without GitHub token'
    };
  }
  
  try {
    console.log('🤖 Generating Auto-Fix...');
    
    if (!aiClient) {
      return {
        applied: false,
        reason: 'GEMINI_API_KEY missing',
        message: 'AI required for fix generation'
      };
    }
    
    // Use predictions to guide fix generation
    const topSolution = predictions.predictions && predictions.predictions[0];
    
    const fixPrompt = `You are an expert code fixer. Generate a fix for this issue:

**Problem:** ${analysis.search_terms}
**Keywords:** ${analysis.keywords.join(', ')}
**Repo:** ${owner}/${name}

${topSolution ? `**Most Successful Solution (${(topSolution.success_rate * 100).toFixed(0)}% success rate):** ${topSolution.label}` : ''}

Generate a JSON array of file changes in this EXACT format (no markdown):
[
  {
    "path": "src/utils/fetch.js",
    "action": "modify",
    "content_b64": "base64_encoded_content_here",
    "additions": 10,
    "deletions": 2,
    "bytes": 1234,
    "reason": "Fix memory leak by adding AbortController"
  }
]

Rules:
1. Return ONLY the JSON array, no explanation
2. Use realistic file paths for ${analysis.tech_stack.join('/')} projects
3. Encode content as base64
4. Focus on the ${topSolution ? topSolution.label : 'most likely fix'}
5. Maximum 3 files`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: fixPrompt
    });
    
    let changesText = response.text.trim();
    changesText = changesText.replace(/```json\n?|\n?```/g, '').trim();
    
    const changes = JSON.parse(changesText);
    
    console.log(`   ✓ Generated fixes for ${changes.length} files`);
    
    if (dryRun) {
      return {
        applied: false,
        dryRun: true,
        changes,
        message: `Dry-run: Would modify ${changes.length} files`
      };
    }
    
    // Create branch and PR
    const branchName = `codewhisper-fix-${Date.now()}`;
    
    // This is a simplified version - in production you'd:
    // 1. Get base branch SHA
    // 2. Create new branch
    // 3. Create/update files via GitHub API
    // 4. Create pull request
    
    console.log(`   Would create branch: ${branchName}`);
    console.log(`   Would create PR with ${changes.length} changes`);
    
    return {
      applied: false,
      dryRun: false,
      branch: branchName,
      base,
      changes,
      message: 'PR creation not fully implemented (demo mode)',
      prUrl: `https://github.com/${owner}/${name}/compare/${base}...${branchName}?expand=1`
    };
    
  } catch (e) {
    console.error('❌ Auto-fix generation failed:', e.message);
    return {
      applied: false,
      error: e.message,
      message: 'Fix generation failed'
    };
  }
}

// ============================================
// STACK OVERFLOW CONTEXT
// ============================================
async function fetchSOContext(analysis) {
  try {
    console.log('🔍 Fetching Stack Overflow context...');
    const query = encodeURIComponent(analysis.search_terms);
    const res = await axios.get(
      `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${query}&site=stackoverflow&pagesize=5&filter=withbody`,
      { timeout: 10000 }
    );
    
    return res.data.items.map(item => ({
      title: item.title,
      score: item.score,
      link: item.link,
      answered: item.is_answered,
      answer_count: item.answer_count,
      tags: item.tags
    }));
  } catch (e) {
    console.error('⚠️  Stack Overflow fetch failed:', e.message);
    return [];
  }
}

// ============================================
// AI RESPONSE GENERATION
// ============================================
async function generateAIResponse(query, context, predictions) {
  if (!aiClient) {
    return `## ⚠️ Gemini API Not Configured\n\n${context}`;
  }

  try {
    const predictionContext = predictions && predictions.predictions && predictions.predictions.length > 0
      ? `\n\n## 🎯 PROVEN SOLUTION ANALYSIS\n\n${predictions.predictions.map((p, i) => 
          `${i + 1}. **${p.label}** - ${(p.success_rate * 100).toFixed(0)}% success rate (${p.success_count}/${p.success_count + p.failure_count} worked)\n   Confidence: ${p.confidence}\n   Evidence: ${p.evidence.map(e => `#${e.issue}`).join(', ')}`
        ).join('\n\n')}`
      : '';

    const enhancedPrompt = `You are CodeWhisper Forge, an expert code assistant.

**User Query:** ${query}

**Context:**
${context}
${predictionContext}

**Your Task:**
Provide a comprehensive response with:

1. 🎯 **Root Cause Analysis** - Be specific
2. ⚡ **Quick Wins** - 2-3 immediate fixes with code
3. 🏆 **RECOMMENDED SOLUTION** - ${predictions?.predictions?.[0] ? `Use the "${predictions.predictions[0].label}" approach (${(predictions.predictions[0].success_rate * 100).toFixed(0)}% proven success rate!)` : 'Best approach based on context'}
4. 📝 **Code Example** - Working implementation
5. 🔗 **Evidence** - Link to successful resolutions

Style: Confident, direct, use markdown, include emojis.
${predictions?.predictions?.[0] ? `CRITICAL: Emphasize that the ${predictions.predictions[0].label} approach has PROVEN ${(predictions.predictions[0].success_rate * 100).toFixed(0)}% success in ${predictions.predictions[0].trials} similar cases!` : ''}

End with: "🚀 Want me to generate a PR with this fix? Just say GO!"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: enhancedPrompt
    });
    
    return response.text;
    
  } catch (e) {
    console.error('❌ AI response generation failed:', e.message);
    return `## ⚠️ AI Response Failed\n\n${context}`;
  }
}

// ============================================
// CONTEXT FORMATTING
// ============================================
function formatContext(analysis, gh, so, predictions) {
  let context = `## 📊 Query Analysis\n\n`;
  context += `- **Intent:** ${analysis.intent}\n`;
  context += `- **Keywords:** ${analysis.keywords.join(', ') || 'None'}\n`;
  context += `- **Severity:** ${analysis.severity || 'medium'}\n\n`;
  
  if (gh.repo_info && gh.repo_info.name) {
    context += `## 📦 Repository: ${gh.repo_info.name}\n\n`;
    context += `- **Stars:** ${gh.repo_info.stars || 0}⭐\n`;
    context += `- **Language:** ${gh.repo_info.language || 'N/A'}\n`;
    context += `- **Open Issues:** ${gh.repo_info.open_issues || 0}\n\n`;
  }
  
  if (predictions && predictions.predictions && predictions.predictions.length > 0) {
    context += `## 🎯 PROVEN SOLUTIONS (Success Rate Analysis)\n\n`;
    predictions.predictions.forEach((p, i) => {
      context += `### ${i + 1}. ${p.label} — ${(p.success_rate * 100).toFixed(0)}% Success\n`;
      context += `- **Worked:** ${p.success_count} times\n`;
      context += `- **Failed:** ${p.failure_count} times\n`;
      context += `- **Confidence:** ${p.confidence}\n`;
      context += `- **Evidence:** ${p.evidence.map(e => `[#${e.issue}](${e.link})`).join(', ')}\n\n`;
    });
  }
  
  if (gh.issues && gh.issues.length > 0) {
    context += `## 🐛 Relevant Open Issues\n\n`;
    gh.issues.forEach(issue => {
      context += `- **#${issue.number}**: ${issue.title} ([link](${issue.url}))\n`;
    });
    context += `\n`;
  }
  
  if (gh.commits && gh.commits.length > 0) {
    context += `## 📝 Related Commits\n\n`;
    gh.commits.slice(0, 5).forEach(commit => {
      context += `- \`${commit.sha}\` ${commit.message}\n`;
    });
    context += `\n`;
  }
  
  if (so && so.length > 0) {
    context += `## 💡 Stack Overflow Solutions\n\n`;
    so.forEach(item => {
      const status = item.answered ? '✅' : '❓';
      context += `- ${status} [${item.title}](${item.link}) (${item.score} votes)\n`;
    });
  }
  
  return context;
}

// ============================================
// MAIN MCP ENDPOINT
// ============================================
app.post('/mcp', async (req, res) => {
  const { query, repoOwner, repoName, enableIRP = true, enableAFG } = req.body;
  
  if (!query || !repoOwner || !repoName) {
    return res.status(400).json({ 
      error: "Missing required fields",
      required: ["query", "repoOwner", "repoName"]
    });
  }

  const startTime = Date.now();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 NEW REQUEST: "${query}"`);
  console.log(`📦 Repository: ${repoOwner}/${repoName}`);
  console.log(`🎯 IRP: ${enableIRP ? 'ON' : 'OFF'} | AFG: ${enableAFG ? 'ON' : 'OFF'}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Stage 1: Analyze query
    console.log('📊 Stage 1: Analyzing query...');
    const analysis = await smartAnalyze(query);
    console.log('   Keywords:', analysis.keywords);

    // Stage 2: Fetch context
    console.log('\n🌐 Stage 2: Fetching context...');
    const [gh, so] = await Promise.all([
      fetchGitHubContext(analysis, repoOwner, repoName),
      fetchSOContext(analysis)
    ]);
    
    console.log(`   ✓ Found ${gh.issues.length} issues, ${so.length} SO posts`);

    // Stage 3: Resolution Predictor (NEW!)
    let predictions = null;
    if (enableIRP) {
      console.log('\n🎯 Stage 3: Running Resolution Predictor...');
      predictions = await analyzeResolutionProbability(analysis, repoOwner, repoName);
      console.log(`   ✓ Generated ${predictions.predictions?.length || 0} predictions`);
    }

    // Stage 4: Format context
    console.log('\n📝 Stage 4: Formatting context...');
    const formattedContext = formatContext(analysis, gh, so, predictions);

    // Stage 5: AI response
    console.log('\n🤖 Stage 5: Generating AI response...');
    const aiResponse = await generateAIResponse(query, formattedContext, predictions);

    // Stage 6: Auto-Fix Generator (NEW!)
    let prPlan = null;
    if (enableAFG) {
      console.log('\n🔧 Stage 6: Generating Auto-Fix...');
      prPlan = await generateAutoFix(
        analysis, 
        predictions || {}, 
        repoOwner, 
        repoName, 
        enableAFG
      );
      console.log(`   ✓ ${prPlan.dryRun ? 'Dry-run' : 'Live'} mode: ${prPlan.changes?.length || 0} files`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Request completed in ${totalTime}ms\n`);

    res.json({
      success: true,
      query,
      analysis,
      context: {
        markdown: formattedContext,
        github: {
          repo_info: gh.repo_info,
          issues: gh.issues,
          commits: gh.commits,
          trending: gh.trending
        },
        stackoverflow: so
      },
      predictions,
      prPlan,
      ai_response: aiResponse,
      metadata: {
        timestamp: new Date().toISOString(),
        processing_time_ms: totalTime,
        using_gemini: !!aiClient,
        using_github_token: !!process.env.GITHUB_TOKEN,
        features: {
          irp: enableIRP,
          afg: !!enableAFG
        }
      }
    });

  } catch (e) {
    console.error('\n❌ ERROR:', e.message);
    res.status(500).json({ 
      success: false,
      error: e.message
    });
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    gemini: !!aiClient,
    github_token: !!process.env.GITHUB_TOKEN,
    hf_token: !!process.env.HF_TOKEN,
    now: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔥 CodeWhisper Forge v9 - WINNING EDITION');
  console.log('='.repeat(60));
  console.log(`\n📡 Server: http://localhost:${PORT}`);
  console.log(`✨ Features: Issue Resolution Predictor + Auto-Fix Generator\n`);
  console.log('Configuration:');
  console.log(`  ${aiClient ? '✅' : '❌'} Gemini API`);
  console.log(`  ${process.env.GITHUB_TOKEN ? '✅' : '⚠️ '} GitHub Token`);
  console.log('\n' + '='.repeat(60) + '\n');
});