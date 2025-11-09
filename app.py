import base64
import io
import json
import time
import zipfile
from typing import Any, Dict, List, Optional

import requests
import streamlit as st

# ==========================================
# HTTP UTILITIES
# ==========================================
def http_get_json(url: str, timeout: int = 10) -> Dict[str, Any]:
    r = requests.get(url, timeout=timeout)
    if r.status_code >= 400:
        raise RuntimeError(f"{r.status_code} {r.text[:200]}")
    return r.json()

def http_post_json(url: str, payload: Dict[str, Any], timeout: int = 60) -> Dict[str, Any]:
    r = requests.post(url, json=payload, timeout=timeout)
    if r.status_code >= 400:
        raise RuntimeError(f"{r.status_code} {r.text[:200]}")
    return r.json()

# ==========================================
# UTILITY FUNCTIONS
# ==========================================
def badge(ok: bool, yes="Configured", no="Missing") -> str:
    return f":green[✅ {yes}]" if ok else f":red[❌ {no}]"

def b64_to_bytes(s: str) -> bytes:
    return base64.b64decode(s.encode("utf-8"))

def build_zip_from_changes(changes: List[dict]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for ch in changes:
            path = ch.get("path", "file.txt")
            content_b64 = ch.get("content_b64")
            if not content_b64:
                continue
            z.writestr(path, b64_to_bytes(content_b64))
    return buf.getvalue()

# ==========================================
# RENDER FUNCTIONS
# ==========================================
def render_repo_info(repo_info: Dict[str, Any]):
    if not repo_info:
        st.info("📦 No repository info available")
        return
    
    cols = st.columns(4)
    cols[0].metric("Repository", repo_info.get("name", "—"))
    cols[1].metric("⭐ Stars", f"{repo_info.get('stars', 0):,}")
    cols[2].metric("Language", repo_info.get("language", "—"))
    cols[3].metric("Open Issues", repo_info.get("open_issues", 0))
    
    if repo_info.get("description"):
        st.caption(f"📝 {repo_info['description']}")

def render_analysis(analysis: Dict[str, Any]):
    if not analysis:
        return
    
    cols = st.columns(4)
    cols[0].metric("Intent", analysis.get("intent", "—").upper())
    cols[1].metric("Severity", analysis.get("severity", "medium").upper())
    cols[2].metric("Keywords", len(analysis.get("keywords", [])))
    cols[3].metric("Tech Stack", len(analysis.get("tech_stack", [])))
    
    if analysis.get("keywords"):
        st.caption(f"🔑 Keywords: {', '.join(analysis['keywords'])}")

def render_issues(issues: List[Dict[str, Any]]):
    if not issues:
        st.info("🐛 No relevant issues found")
        return
    
    st.markdown(f"### 🐛 Found {len(issues)} Relevant Issues")
    for i in issues:
        with st.expander(f"#{i['number']}: {i['title']}", expanded=False):
            cols = st.columns([3, 1])
            cols[0].markdown(f"**Labels:** {', '.join(i.get('labels', []))}")
            cols[1].markdown(f"💬 {i.get('comments', 0)} comments")
            st.markdown(f"[View on GitHub]({i['url']})")

def render_commits(commits: List[Dict[str, Any]]):
    if not commits:
        st.info("📝 No recent commits")
        return
    
    st.markdown(f"### 📝 Recent Commits ({len(commits)})")
    for c in commits[:5]:
        st.markdown(f"- `{c['sha']}` {c['message']} *by {c.get('author', '?')}*")

def render_trending(tr: List[Dict[str, Any]]):
    if not tr:
        st.info("⭐ No trending repos found")
        return
    
    st.markdown(f"### ⭐ Trending Related Repos")
    for r in tr:
        st.markdown(f"**[{r['name']}]({r['url']})** — {r['stars']:,}⭐")
        if r.get('description'):
            st.caption(r['description'])

def render_stackoverflow(items: List[Dict[str, Any]]):
    if not items:
        st.info("💡 No Stack Overflow results")
        return
    
    st.markdown(f"### 💡 Stack Overflow ({len(items)} posts)")
    for it in items:
        icon = "✅" if it.get("answered") else "❓"
        st.markdown(
            f"{icon} **[{it['title']}]({it['link']})**\n"
            f"  - {it['score']} votes | {it['answer_count']} answers | "
            f"Tags: `{', '.join(it['tags'][:3])}`"
        )

def render_predictions(pred: Optional[Dict[str, Any]]):
    """🔥 NEW: Render Issue Resolution Predictions"""
    if not pred or not pred.get("predictions"):
        st.info("🎯 No resolution predictions available")
        st.caption("Enable IRP (Issue Resolution Predictor) to see success rate analysis")
        return
    
    predictions = pred["predictions"]
    
    st.markdown("## 🎯 Issue Resolution Predictor Results")
    st.success(f"✅ Analyzed {pred.get('total_issues_analyzed', 0)} similar closed issues")
    st.caption(f"Confidence: **{pred.get('confidence', 'medium').upper()}**")
    
    # Create comparison table
    if predictions:
        st.markdown("### 📊 Solution Success Rates")
        
        for idx, p in enumerate(predictions):
            success_pct = p['success_rate'] * 100
            
            # Color code by success rate
            if success_pct >= 70:
                color = "🟢"
                style = "success"
            elif success_pct >= 40:
                color = "🟡"
                style = "warning"
            else:
                color = "🔴"
                style = "error"
            
            with st.expander(
                f"{color} **#{idx + 1}: {p['label']}** — {success_pct:.0f}% Success Rate",
                expanded=(idx == 0)  # Expand best solution
            ):
                cols = st.columns(3)
                cols[0].metric("Success Rate", f"{success_pct:.0f}%")
                cols[1].metric("✅ Worked", p['success_count'])
                cols[2].metric("❌ Failed", p['failure_count'])
                
                st.markdown(f"**Confidence:** {p['confidence'].upper()}")
                st.markdown(f"**Trials:** {p['trials']} cases analyzed")
                
                if p.get('evidence'):
                    st.markdown("**Evidence from:**")
                    for ev in p['evidence']:
                        st.markdown(f"- [Issue #{ev['issue']}]({ev['link']}): {ev.get('title', '')[:60]}...")
        
        # Visualization
        try:
            import matplotlib.pyplot as plt
            import numpy as np
            
            fig, ax = plt.subplots(figsize=(10, 4))
            labels = [p['label'][:30] for p in predictions]
            success_rates = [p['success_rate'] * 100 for p in predictions]
            colors = ['#00cc66' if sr >= 70 else '#ffaa00' if sr >= 40 else '#ff4444' for sr in success_rates]
            
            bars = ax.barh(labels, success_rates, color=colors)
            ax.set_xlabel('Success Rate (%)', fontsize=12)
            ax.set_title('Solution Effectiveness Comparison', fontsize=14, fontweight='bold')
            ax.set_xlim(0, 100)
            ax.invert_yaxis()
            
            # Add value labels on bars
            for bar in bars:
                width = bar.get_width()
                ax.text(width + 2, bar.get_y() + bar.get_height()/2, 
                       f'{width:.0f}%', ha='left', va='center', fontweight='bold')
            
            plt.tight_layout()
            st.pyplot(fig, clear_figure=True)
        except ImportError:
            st.caption("Install matplotlib for visualizations: `pip install matplotlib`")
    
    # Recommendation
    if predictions and predictions[0]['success_rate'] > 0.5:
        st.success(
            f"💡 **RECOMMENDATION:** Try the '{predictions[0]['label']}' approach first. "
            f"It has a **{predictions[0]['success_rate'] * 100:.0f}%** proven success rate!"
        )

def render_pr_plan(pr: Optional[Dict[str, Any]]):
    """🔥 NEW: Render Auto-Fix Generator Results"""
    if not pr:
        st.info("🤖 Auto-Fix Generator not requested")
        st.caption("Enable AFG to automatically generate fixes")
        return
    
    st.markdown("## 🤖 Auto-Fix Generator Results")
    
    if pr.get("applied"):
        st.success(f"✅ Pull Request Created!")
        st.markdown(f"**PR URL:** [{pr.get('prUrl')}]({pr.get('prUrl')})")
        st.markdown(f"**Branch:** `{pr.get('branch')}`")
        return
    
    if pr.get("reason") == "GITHUB_TOKEN missing":
        st.warning("⚠️ Cannot create PR without GitHub token configured on server")
        st.caption("Add GITHUB_TOKEN to server's .env file to enable PR creation")
    
    if pr.get("reason") == "GEMINI_API_KEY missing":
        st.error("❌ AI required for fix generation (GEMINI_API_KEY not configured)")
        return
    
    if pr.get("error"):
        st.error(f"❌ Fix generation failed: {pr['error']}")
        return
    
    changes = pr.get("changes", [])
    
    if not changes:
        st.info("ℹ️ No changes generated")
        return
    
    # Display summary
    if pr.get("dryRun"):
        st.info(f"🧪 **DRY RUN MODE** — No actual changes made")
    
    total_additions = sum(c.get('additions', 0) for c in changes)
    total_deletions = sum(c.get('deletions', 0) for c in changes)
    
    cols = st.columns(4)
    cols[0].metric("Files Modified", len(changes))
    cols[1].metric("Lines Added", total_additions, delta_color="normal")
    cols[2].metric("Lines Removed", total_deletions, delta_color="inverse")
    cols[3].metric("Branch", pr.get('branch', 'N/A')[:20])
    
    # Display file changes
    st.markdown("### 📝 Proposed Changes")
    for idx, ch in enumerate(changes):
        with st.expander(f"📄 {ch['path']}", expanded=(idx == 0)):
            cols = st.columns(3)
            cols[0].metric("Action", ch.get('action', 'modify').upper())
            cols[1].metric("+ Lines", ch.get('additions', 0))
            cols[2].metric("- Lines", ch.get('deletions', 0))
            
            if ch.get('reason'):
                st.markdown(f"**Reason:** {ch['reason']}")
            
            # Try to decode and show content preview
            if ch.get('content_b64'):
                try:
                    content = b64_to_bytes(ch['content_b64']).decode('utf-8')
                    st.code(content[:500] + ("..." if len(content) > 500 else ""), language='python')
                except:
                    st.caption("(Binary content or decode error)")
    
    # Download button
    if changes:
        zip_bytes = build_zip_from_changes(changes)
        st.download_button(
            "📥 Download All Changes (ZIP)",
            data=zip_bytes,
            file_name=f"codewhisper_fix_{int(time.time())}.zip",
            mime="application/zip",
            type="primary"
        )
    
    if pr.get('prUrl'):
        st.markdown(f"[🔗 View on GitHub]({pr['prUrl']})")

# ==========================================
# MAIN UI
# ==========================================
st.set_page_config(
    page_title="CodeWhisper Forge — MCP UI",
    page_icon="🛠️",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🛠️ CodeWhisper Forge")
st.caption("AI-Powered Issue Resolution with Success Rate Prediction")

# ==========================================
# SIDEBAR
# ==========================================
with st.sidebar:
    st.markdown("## 🎯 Features")
    
    enableIRP = st.checkbox(
        "🎯 Issue Resolution Predictor (IRP)",
        value=True,
        help="Analyzes similar closed issues to predict which solutions work best"
    )
    
    enableAFG = st.checkbox(
        "🤖 Auto-Fix Generator (AFG)",
        value=False,
        help="Automatically generates code fixes and creates PR"
    )
    
    if enableAFG:
        st.markdown("### AFG Options")
        dryRun = st.checkbox("Dry Run (no PR)", value=True)
        base_branch = st.text_input("Base Branch", value="main")
    else:
        dryRun = True
        base_branch = "main"

# Base URL (hardcoded)
base_url = "http://localhost:3000"

# ==========================================
# MAIN CONTENT
# ==========================================
st.markdown("## 🔍 Query Input")

col1, col2 = st.columns([3, 1])

with col1:
    query = st.text_area(
        "Describe your issue",
        value=st.session_state.get("query", "Memory leak with Node 22 fetch"),
        height=100,
        placeholder="e.g., login is slow with Next.js",
        help="Describe the problem you're facing"
    )

with col2:
    repoOwner = st.text_input(
        "Repository Owner",
        value=st.session_state.get("owner", "vercel"),
        help="GitHub username or organization"
    )
    repoName = st.text_input(
        "Repository Name",
        value=st.session_state.get("repo", "next.js"),
        help="Repository name"
    )

# Run button
if st.button("⚡ Analyze with CodeWhisper Forge", type="primary", use_container_width=True):
    if not query or not repoOwner or not repoName:
        st.error("❌ Please fill in all fields")
    else:
        # Store in session
        st.session_state["query"] = query
        st.session_state["owner"] = repoOwner
        st.session_state["repo"] = repoName
        
        # Build payload
        payload = {
            "query": query,
            "repoOwner": repoOwner,
            "repoName": repoName,
            "enableIRP": enableIRP,
        }
        
        if enableAFG:
            payload["enableAFG"] = {"dryRun": dryRun, "base": base_branch}
        
        # Make request
        with st.spinner("🔄 Analyzing..."):
            try:
                start_time = time.time()
                data = http_post_json(f"{base_url}/mcp", payload, timeout=90)
                elapsed = time.time() - start_time
                
                st.success(f"✅ Analysis Complete!")
                
                # Store result
                st.session_state["last_result"] = data
                
            except Exception as e:
                st.error(f"❌ Request failed: {e}")
                st.stop()

# ==========================================
# RESULTS DISPLAY
# ==========================================
if "last_result" in st.session_state:
    data = st.session_state["last_result"]
    
    st.markdown("---")
    st.markdown("## 📊 Results")
    
    # Tabs
    tabs = st.tabs([
        "🤖 AI Response",
        "🎯 Predictions",
        "📦 Repository",
        "💡 Solutions",
        "🔧 Auto-Fix",
        "📄 Raw Data"
    ])
    
    # Tab 1: AI Response
    with tabs[0]:
        st.markdown("### 🤖 AI Analysis")
        ai_resp = data.get("ai_response", "_No response_")
        st.markdown(ai_resp)
        
        # Analysis summary
        if data.get("analysis"):
            with st.expander("📊 Query Analysis Details"):
                render_analysis(data["analysis"])
    
    # Tab 2: Predictions (IRP)
    with tabs[1]:
        render_predictions(data.get("predictions"))
    
    # Tab 3: Repository Info
    with tabs[2]:
        context = data.get("context", {})
        github = context.get("github", {})
        
        render_repo_info(github.get("repo_info"))
        
        st.markdown("---")
        render_issues(github.get("issues", []))
        
        st.markdown("---")
        render_commits(github.get("commits", []))
        
        st.markdown("---")
        render_trending(github.get("trending", []))
    
    # Tab 4: Stack Overflow
    with tabs[3]:
        render_stackoverflow(data.get("context", {}).get("stackoverflow", []))
    
    # Tab 5: Auto-Fix (AFG)
    with tabs[4]:
        render_pr_plan(data.get("prPlan"))
    
    # Tab 6: Raw JSON
    with tabs[5]:
        st.json(data, expanded=False)

# ==========================================
# FOOTER
# ==========================================
st.markdown("---")
st.caption(
    "🛠️ **CodeWhisper Forge** — Built for hackathon winning | "
    "Features: IRP (Issue Resolution Predictor) + AFG (Auto-Fix Generator)"
)