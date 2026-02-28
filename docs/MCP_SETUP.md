# MCP & API Key Setup

One-time setup for AI tool integrations. Keys go in `.env` (gitignored). MCP configs go in `~/.claude/settings.json` (global, outside repo).

---

## Step 1 — Create your `.env`

```bash
cp .env.example .env
```

Fill in each key. Never commit `.env`.

---

## Step 2 — Tavily Web Search (Gemini CLI)

**What it does:** Gives Gemini CLI web search capability via `run_shell_command`.

**Sign up:** https://app.tavily.com — free tier available.

**Get key:** Dashboard → API Keys → Create.

**Add to `.env`:**
```
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxx
```

**How Gemini uses it:**
```bash
curl -s -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d "{\"api_key\":\"$(grep TAVILY_API_KEY .env | cut -d= -f2)\",\"query\":\"your search here\"}"
```

---

## Step 3 — Claude Code MCP Config

Create or edit `~/.claude/settings.json` (global — never in the repo):

```json
{
  "mcpServers": {
    "tavily": {
      "type": "sse",
      "url": "https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_TAVILY_API_KEY"
    }
  }
}
```

Replace `YOUR_TAVILY_API_KEY` with the value from `.env`.

**Verify:** Restart Claude Code — `/mcp` should list `tavily` as connected.

---

## Adding a new MCP

1. Get API key → add to `.env` and `.env.example` (no value in example)
2. Add MCP server block to `~/.claude/settings.json`
3. Document it in this file under a new Step
