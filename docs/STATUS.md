# Project Status

Handoff document between Claude (implementation guidance) and Gemini (documentation/architecture). Claude updates this after each session. Gemini reads this before working on docs tasks.

---

## Current Sprint

**Goal:** Polish and showcase readiness.

**Last completed (2026-02-28 session 2):**
- Tavily web search set up for Gemini CLI — API key in .env, curl pattern in docs/MCP_SETUP.md, 1,000 req/month limit
- Booking retrieve/cancel: switched from orderId to PNR at all layers (mock-services API, toolExecutors, llmService function declarations)
- System prompt: bot now asks for PNR + email before retrieve/cancel, declines off-topic requests, presents PNR after booking
- Automation tests updated to PNR-based flow (apiHelpers, mockSteps, flowSteps, booking.feature)

**Last completed (2026-02-28 session 1):**
- Mock-services GitHub auto-deploy connected (Root Directory = mock-services)
- Passengers route fixed — guard against missing itineraries on real bookings
- CI trigger fixed — deployment_status state==success (no environment filter needed), 2 runs per push both pass
- All 10 Cucumber tests passing — verified via auto-trigger and manual dispatch

**Up next:**
1. Logging: Implement fixes from LOGGING_AUDIT.md — axios interceptor (apiHelpers.js), hooks.js error message, mockSteps.js cleanup warn
2. Mobile UI: Bridge Cucumber to Maestro (Android) — reusable Gherkin steps backed by Maestro YAML flows with env var substitution. Prototype here, carry over to work project (Xray). Handoff doc at completion.
3. CSR Layer: Salesforce free developer tier — simulate case creation to resolution, bot escalates via API
4. LLM: Fix travelers id field description (sequential "1", "2" — not passport ID)
5. LLM: Resolve relative dates ("tomorrow", "next Monday") using today's date from system prompt

---

## Built Components

| Component | Status | Notes |
|---|---|---|
| **Backend** | | |
| Express Server | ✅ Done | Port 3000, CORS, JSON parsing, helmet/hpp/rate-limit |
| MongoDB Connection | ✅ Done | Atlas cluster via mongoose |
| Health Check | ✅ Done | GET /api/health |
| Flight Search | ✅ Done | GET /api/flights/search → Amadeus proxy |
| Amadeus Client | ✅ Done | SDK initialized with env credentials |
| User Model | ✅ Done | email, password, name, role + bcrypt + comparePassword |
| Booking Model | ✅ Done | userId, flightDetails, pnr, status |
| Auth Middleware | ✅ Done | Passport JWT + requireAuth + requireRole('agent') |
| Auth Endpoints | ✅ Done | POST /api/auth/signup + POST /api/auth/login, JWT 7d |
| LLM Service | ✅ Done | Gemini function calling, 5-iteration loop |
| Anti-hallucination System Prompt | ✅ Done | `backend/services/llmService.js` — Gemini must call tools, never invent PNRs or booking data |
| Tool Executors | ✅ Done | HTTP calls to backend + mock-service endpoints |
| Chat Endpoint | ✅ Done | POST /api/chat — protected, rate-limited 20/15min |
| Optional Auth Middleware | ✅ Done | `backend/routes/chat.js` — anonymous users get role:'user', authenticated agents get JWT role |
| **Mock Services** | | |
| server.js | ✅ Done | Express port 3001, MongoDB before listen |
| config/db.js | ✅ Done | Async connectDB() with error handling |
| models/MockFlightOrder.js | ✅ Done | orderId + orderData (Mixed) + timestamps |
| scripts/seed.js | ✅ Done | Idempotent seed for MOCK-ORDER-1001 |
| data/mockData.js | ✅ Done | Flight offers, dictionaries, helpers |
| routes/booking.js | ✅ Done | POST/GET/DELETE /flight-orders (MongoDB) |
| routes/passengers.js | ✅ Done | GET /:flightNumber/passengers (MongoDB) |
| Service Auth | ✅ Done | x-service-key header on all mock routes |
| **Frontend** | | |
| Expo Chat Screen | ✅ Done | Wired to POST /api/chat |
| Loading animation | ✅ Done | Disabled send during bot reply |
| **Deployment** | | |
| Backend on Vercel | ✅ Done | https://flightchatbot.vercel.app |
| Mock Services on Vercel | ✅ Done | https://mock-services-beta.vercel.app |
| Mock Services GitHub auto-deploy | ✅ Done | Vercel Settings → Git, Root Directory = mock-services — missed when backend auto-deploy was set up |
| Mock Services MONGODB_URI on Vercel | ✅ Done | Already set — Claude incorrectly assumed it was missing and asked user to verify twice |
| CI double-cancel diagnosis | ⚠️ Mistake | Made 3 code changes guessing at root cause (target_url filter, revert, move concurrency) without verifying what was actually triggering the cancellations — user had to stop Claude and ask to verify first |
| ignoreCommand rollout | ⚠️ Mistake | Changed both backend and mock-services vercel.json in one push — three times, including the commit that introduced the one-service-per-push rule itself |
| Manual dispatch claim | ⚠️ Mistake | Stated "manual dispatch works" in summary without verifying — had not been tested since concurrency was removed |
| Brave Search API free tier | ⚠️ Mistake | Kanban referenced "free tier 2k queries/month" from training data — Brave dropped the free tier in 2025. Always verify training data against real current data before presenting anything as fact |
| **Automation** | | |
| Cucumber scaffold | ✅ Done | Features, step defs, helpers, hooks |
| Feature files | ✅ Done | health, chat, booking, passengers, happy-path flow |
| Step definitions | ✅ Done | backendSteps.js, mockSteps.js, flowSteps.js |
| apiHelpers.js | ✅ Done | Axios clients for backend + mock-service |
| Test data cleanup | ✅ Done | After hook deletes created orders in MongoDB |
| Tag conventions | ✅ Done | @api-contracts, @happy-path, @local, @wip |
| Allure reporting | ✅ Done | allure-cucumberjs, GitHub Pages, history trend |
| Historical runs index | ✅ Done | runs.html — per-run report links, accumulated via runs.json |
| GitHub Actions | ✅ Done | Push/PR auto-run + manual dispatch |
| CI deployment_status trigger | ✅ Done | `.github/workflows/cucumber-tests.yml` — tests run only after Vercel confirms successful deploy |
| **Linear Integration** | | |
| linearHelper.js | ✅ Done | GraphQL: createLabel, createIssue, updateIssueStatus, addComment |
| cucumber-to-linear.js | ✅ Done | Post-processor — creates tickets, patches allure results |
| CI flag | ✅ Done | workflow_dispatch boolean `create_linear_tickets` |
| Allure ↔ Linear link | ✅ Done | Allure result JSON patched with Linear issue URL |
| **Repo** | | |
| Boilerplate branch | ✅ Done | `origin/boilerplate` — empty scaffold for learners |
| Branch protection | ✅ Done | main requires PR + 1 approval (admin bypass enabled) |
| README | ✅ Done | Full docs with Linear screenshot |

---

## Architecture

```
Mobile (Expo) → POST /api/chat
                    ↓
             Backend (Express)
             ├── Gemini LLM (function calling)
             │   └── toolExecutors.js
             │       ├── GET /api/flights/search → Amadeus API
             │       ├── GET/DELETE /mock-api/booking/flight-orders/:id
             │       └── GET /mock-api/flights/:flightNumber/passengers
             └── MongoDB Atlas (users, bookings)

Mock Services (Express) ← x-service-key auth
└── MongoDB Atlas (mockflightorders collection)

CI/CD (GitHub Actions)
├── npm test → cucumber-report.json + allure-results/
├── npm run linear → Linear tickets + allure patches (manual only)
├── npm run report → allure-report/
├── Copy report → reports/ci-N/ subfolder
├── npm run generate-index → runs.html + runs.json
└── Deploy → GitHub Pages (keep_files: true)
    ├── / → Latest Allure report
    ├── runs.html → Historical runs index
    └── reports/ci-N/ → Per-run Allure reports
```

---

## Live Links

- **Allure Report:** https://adggalman.github.io/flightChatbot/
- **Historical Runs:** https://adggalman.github.io/flightChatbot/runs.html
- **Backend API:** https://flightchatbot.vercel.app
- **Mock Services:** https://mock-services-beta.vercel.app

---

## Gemini TODO

### Task Status — Claude-managed (Gemini: read only, do not edit this table)

Status legend: 🔲 Pending | 🔄 In Progress | 👀 In Review (done, awaiting user sign-off — do not rework) | ✅ Done

| Task | Status |
|------|--------|
| Task 1 — Fix ARCHITECTURE.md diagram | ✅ Done |
| Task 2 — Add runs.html screenshot to README | ✅ Done |
| Task 3 — Add Allure screenshot to README | ✅ Done |
| Task 4 — Final README review | ✅ Done |
| Task 5 — UX Research: Airline Chatbot Benchmark Study | ✅ Done |
| Task 6 — Update Built Components table | ✅ Done |
| Task 7 — Research: Skills, Agents, MCP | ✅ Done |
| Task 8 — Learning Journey: Agents, Skills, MCP | ✅ Done |
| Task 9 — API Inventory | ✅ Done |
| Task 10 — CI/Test Logging Audit | ✅ Done |
| Task 11 — WORKFLOW.md | ✅ Done |

---

### Task 1 — Fix ARCHITECTURE.md diagram

The ASCII diagram in `docs/ARCHITECTURE.md` has bugs:
1. The `(Proxy)` box label is fine conceptually (backend proxies Amadeus) but the box is a duplicate of the Backend box above — merge them or clarify the flow
2. The `Mock Flight Ops API` box is missing its closing `+-----+` border line
3. The bullet-point descriptions at the bottom are inside the code block (before the closing triple-backtick) — move them outside

Correct architecture flow:
```
Mobile (Expo) → Backend (Express)
                    ├── Gemini AI (function calling) → Amadeus Travel API
                    ├── MongoDB Atlas
                    └── Mock Services (Express) → MongoDB Atlas
Cucumber.js Tests → Backend + Mock Services (API contract tests)
GitHub Actions → Allure → GitHub Pages
```

### Task 2 — Add runs.html screenshot to README

Add a second screenshot to the Linear Integration section in README.md showing the `runs.html` historical runs index page. Use placeholder:
```
![Historical runs index](docs/screenshots/runs-index.png)
```
(User will add the actual screenshot)

### Task 3 — Add Allure screenshot to README

Add a screenshot showing the Allure test detail view with the Linear issue link visible in the "Links" section. Use placeholder:
```
![Allure test with Linear link](docs/screenshots/allure-linear-link.png)
```

### Task 5 — UX Research: Airline Chatbot Benchmark Study

**Web search is now available.** Tavily free tier — **1,000 requests/month limit. Use sparingly.** Use `run_shell_command` with this exact curl pattern:

```bash
source .env && curl -s -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d "{\"api_key\":\"$TAVILY_API_KEY\",\"query\":\"YOUR SEARCH QUERY HERE\"}"
```

Run multiple searches per airline. Example queries:
- `"Singapore Airlines Kris chatbot demo 2024 booking flow"`
- `"KLM BlueBot BB chatbot UX review conversation"`
- `"Singapore Airlines Kris chatbot error handling escalation"`



The file `docs/CHATBOT_BEHAVIOR.md` was created with an empty template. **This is not done.** Every section is blank. You must perform actual research and fill it in.

**IMPORTANT: Do NOT mark this task as done until every section in CHATBOT_BEHAVIOR.md has real content.**

Steps you must follow:
1. Use web search to research each chatbot — look for demos, YouTube walkthroughs, UX reviews, screenshots
2. Fill in every section with real observed behavior — no placeholders, no blanks
3. Overwrite `docs/CHATBOT_BEHAVIOR.md` with the completed findings

Airlines to research (use web search):
- **Singapore Airlines Kris** — search "Singapore Airlines Kris chatbot demo 2024", "Kris chatbot booking flow UX"
- **KLM BlueBot (BB)** — search "KLM BB chatbot UX review", "KLM BlueBot conversation flow"
- **askbo** — leave all sections blank, the user will fill this in from direct experience

For each chatbot, you must fill in:
- Conversation flow: step-by-step how it handles search, booking, retrieval, cancellation
- Error handling: what it says when it can't help, how it escalates to a human agent
- Tone & personality: formal or casual, use of name/emoji, response length
- Scope boundaries: what topics/actions it refuses or redirects

Final section **Recommendations for Our Chatbot** — must contain concrete suggestions based on what you found, not left blank.

Deliverable: `docs/CHATBOT_BEHAVIOR.md` fully populated with real research findings.

**Definition of Done — check every item before marking complete:**
- [ ] Singapore Airlines Kris — all 4 sections filled (flow, errors, tone, scope)
- [ ] KLM BlueBot — all 4 sections filled (flow, errors, tone, scope)
- [ ] askbo — left blank intentionally (user fills in)
- [ ] No placeholder text remaining (no "[Airline Name]", no empty bullet points)
- [ ] Recommendations section has at least 5 concrete suggestions for our chatbot
- [ ] File saved to `docs/CHATBOT_BEHAVIOR.md`

---

### Task 8 — Learning Journey: Agents, Skills, and MCP

**Before writing anything, read `docs/test-automation-process.md` in full.** That is the quality bar. Notice: every step has a number, a heading, real commands in code blocks, exact file paths, and zero vague descriptions. The user wrote that doc and expects the same level of specificity here.

**The problem with your current version:** You described what Skills/Agents/MCP are but never showed HOW to use them. The user cannot follow your instructions because there are no instructions — only descriptions.

**Rewrite the Learning Journey section in `docs/DEV_TOOLING.md` to this spec:**

---

#### Skills — what to write:

### Step 1 — Create your first Skill

Show exactly:
1. What directory to create: `.claude/commands/`
2. What file to create: e.g. `mark-done.md`
3. What the file contains — show the actual markdown content
4. What the user types to invoke it: `/mark-done`
5. Run it and show what happens

---

#### Agents — what to write:

### Step 2 — Invoke your first Agent

Show exactly:
1. The available agent types in Claude Code (list them with one-line descriptions)
2. An example prompt the user types verbatim to invoke an Explore agent on this project
3. What Claude returns and what the user does with it

---

#### MCP — what to write:

### Step 3 — Add MongoDB MCP

Show exactly:
1. What file to edit: `.claude/settings.json` (exact path from project root)
2. The actual JSON block to add — working config for MongoDB Atlas MCP
3. What to install first (npm package name + install command)
4. How to verify it connected
5. An example Claude prompt that uses the MCP to query the `bookings` collection

---

**Definition of Done — check every item:**
- [ ] Section appended to `docs/DEV_TOOLING.md` (existing content preserved)
- [ ] Skills step has: directory path, filename, file contents, invocation command
- [ ] Agents step has: list of agent types, verbatim example prompt, example output description
- [ ] MCP step has: exact JSON config, npm install command, verification step
- [ ] Zero sentences with "you could", "you might", "consider" — everything is direct instruction
- [ ] All commands in fenced code blocks
- [ ] All file paths are explicit (no "the config file" — say `.claude/settings.json`)



---

### Task 9 — API Inventory

Document every API call made in the system. Read these files to extract the endpoints:
- `backend/services/toolExecutors.js` — all LLM tool calls (search, booking, passengers)
- `backend/routes/` — all backend routes exposed to the frontend
- `mock-services/routes/booking.js` — booking CRUD endpoints
- `mock-services/routes/passengers.js` — passenger lookup endpoint
- `mock-services/server.js` — health check

For each endpoint document:
- Method + path
- Auth required (none / JWT / x-service-key)
- Request params/body shape
- Response shape (success + error)

**Deliverable:** `docs/API_INVENTORY.md`

**Definition of Done:**
- [ ] All backend routes documented (health, auth, chat, flights)
- [ ] All mock-services routes documented (health, booking CRUD, passengers)
- [ ] All toolExecutors.js outbound calls documented (what the LLM calls internally)
- [ ] Each entry has: method, path, auth, request shape, response shape
- [ ] No placeholder entries — every field filled with real values from the code
- [ ] File saved to `docs/API_INVENTORY.md`

---

### Task 10 — CI/Test Logging Audit

Study the project end-to-end — tests, pipeline, and report output — and identify where useful logging is missing or insufficient. Goal: when a CI run fails, the developer should be able to diagnose the root cause directly from the GitHub Actions log without downloading files or re-running locally.

**What to read:**
- `.github/workflows/cucumber-tests.yml` — full pipeline
- `automation/src/features/` — all feature files and step definitions
- `automation/src/helpers/apiHelpers.js` — HTTP client setup
- `automation/src/support/hooks.js` — before/after hooks
- `automation/cucumber.js` — formatter config

**What to look for:**
- Steps that fail silently (catch blocks that swallow errors without logging)
- API calls with no request/response logging on failure
- Hooks that could log scenario name, tags, or status but don't
- CI steps that produce no output on success but also no useful output on failure
- Any place where a developer would currently have to guess at root cause

**Deliverable:** `docs/LOGGING_AUDIT.md`

For each gap found, document:
- Location (file + line or CI step name)
- What's missing
- Suggested log line or approach (plain English — do not write code)

**Definition of Done:**
- [ ] All feature files and step definitions reviewed
- [ ] CI pipeline reviewed step by step
- [ ] hooks.js reviewed
- [ ] apiHelpers.js reviewed
- [ ] Every gap documented with location + what's missing + suggestion
- [ ] File saved to `docs/LOGGING_AUDIT.md`

---

### Task 7 — Research: Skills, Agents, and MCP for our Dev Workflow

Research Claude Code and Gemini CLI capabilities for **Skills**, **Agents**, and **MCP (Model Context Protocol)** servers. Goal: identify which ones are worth adopting in this project's dev workflow.

**What to research:**

1. **Claude Code Skills** — slash commands, custom skills, how they work
2. **Claude Code Agents** — subagents (Task tool), when they help, token cost
3. **Claude Code MCP servers** — what's available, how to configure, token implications
4. **Gemini CLI equivalents** — does Gemini CLI support agents or MCP? What tools does it have?

**For each capability, document:**
- What it is (1-2 sentences)
- Pros and cons
- Relevant use case for THIS project (Flight Chatbot — MERN, Vercel, MongoDB Atlas, Cucumber, Linear, GitHub Actions)

**Deliverable:** `docs/DEV_TOOLING.md` with a structured summary — one section per capability, written for a developer deciding whether to adopt it.

**Definition of Done:**
- [ ] Claude Code Skills section complete with pros/cons and project use case
- [ ] Claude Code Agents section complete with pros/cons and project use case
- [ ] Claude Code MCP section complete — list at least 3 specific MCP servers relevant to this project (e.g. MongoDB, GitHub, web search) with pros/cons
- [ ] Gemini CLI tools/agents section complete
- [ ] No placeholder sections or blank entries
- [ ] File saved to `docs/DEV_TOOLING.md`

---

### Task 6 — Update Built Components table in STATUS.md

Update the **Built Components** table to reflect recent additions. Add the following rows:

| Component | Status | Notes |
|---|---|---|
| Optional Auth Middleware | ✅ Done | `backend/routes/chat.js` — anonymous users get role:'user', authenticated agents get JWT role |
| Anti-hallucination System Prompt | ✅ Done | `backend/services/llmService.js` — Gemini must call tools, never invent PNRs or booking data |
| CI deployment_status trigger | ✅ Done | `.github/workflows/cucumber-tests.yml` — tests run only after Vercel confirms successful deploy |

Place these rows under the appropriate sections (Backend and CI/CD).

**Definition of Done:**
- [ ] All 3 rows added to the Built Components table in STATUS.md
- [ ] Rows placed under the correct section headings
- [ ] No existing rows modified or removed

---

### Task 4 — Final README review

Read the full README.md and check:
- All links are correct and working
- The boilerplate branch callout at the top is present
- Step 11 (Linear) is marked as complete (not "In Progress")
- The `runs.html` link is listed in the Live Links section
- GitHub Actions secrets list is complete and accurate

---

## Issue Log & Retro

Log every error, blocker, misconfiguration, AI misstep, and user error here as it happens. Review at end of each session. Action items go to KANBAN.md.

| # | Type | Description | Action Item |
|---|------|-------------|-------------|
| 1 | AI misstep | Mock-services GitHub auto-deploy not connected — missed when backend was set up | Connected, done |
| 2 | AI misstep | Assumed MONGODB_URI missing on Vercel, asked user twice — it was already set | Rule added: never re-ask for confirmed info |
| 3 | AI misstep | Used local .env SERVICE_API_KEY for curl instead of Vercel key | Rule added: prod endpoints use automation/.env |
| 4 | AI misstep | Made 3 CI config changes without verifying root cause first | Rule added: verify root cause before any change |
| 5 | AI misstep | Changed both vercel.json files in one push — three times, including the one-service-per-push commit | Rule added: one service per push |
| 6 | AI misstep | Stated "manual dispatch works" without verifying | Rule added: never claim something works without verifying |
| 7 | AI misstep | Brave Search API free tier referenced from training data — no longer exists | Rule added: verify training data vs real |
| 8 | AI misstep | Echoed API key back in chat response | Rule added: never echo key values |
| 9 | Code bug | Passengers route crashed on real Amadeus bookings — itineraries missing in create_booking response | Fixed with `\|\| []` guard |
| 10 | Misconfig | Vercel mock-services Root Directory not set — served nothing | Fixed, Root Directory = mock-services |
| 11 | LLM behavior | Gemini constructs simplified flightOffers `{segments, price}` instead of passing full Amadeus offer | Kanban: fix function declaration |
| 12 | LLM behavior | Bot presents orderId to user after booking instead of PNR | Kanban: fix system prompt |
| 13 | Code naming | Step definition named "the order should be created with an orderId" after switching to PNR — stale name surfaced in Allure reports | Renamed to "with a PNR" in flowSteps.js + flight-booking.feature |
| 14 | Misconfig | CI `reports/` directory missing on fresh checkout — JSON formatter exits 1 after all tests pass. Masked by pre-existing test failures; only surfaced after tests were fixed | Added `mkdir -p reports/allure/allure-results` before `npm test` in CI workflow |
| 15 | AI misstep | Diagnosed CI exit code 1 by guessing (reports/ directory) without first capturing the actual error — fix didn't work. Should have added stderr logging first to identify root cause before making changes | Rule: add diagnostic logging before attempting fixes for unknown errors |
| 16 | AI misstep | Added `2>&1` + `echo` for diagnostics but bash `-e` flag killed the script before echo ran — incomplete understanding of GitHub Actions shell behavior | Used `set +e` / `set -e` pattern to properly capture exit code without bash exiting early |
| 17 | AI misstep | Embedded Python `-c` inline in YAML `run:` block — code at column 0 broke YAML indentation, workflow showed as file path instead of name (parse error) | Replaced with heredoc to `/tmp/parse_report.py` to keep Python properly indented |
| 18 | AI misstep | `flight-booking.feature` was edited (orderId → PNR step rename) but not staged before commit `f261818` — CI ran old step text, causing `undefined` status and exit code 1 | Rule added: run `git status` after staging to verify all related files are included before committing |
| 19 | AI misstep | Reviewed LOGGING_AUDIT.md from memory instead of re-reading the file — Gemini had updated it but Claude gave feedback on the stale version | Rule added: always re-read docs files before giving feedback, never rely on in-session memory |
| 20 | AI misstep | Gemini attempted to write a .js script (code implementation), violating role definitions in `docs/WORKFLOW.md` where the Tech Lead is responsible for code. | Rule added: Before starting implementation, Gemini must verify the task type against the roles defined in `docs/WORKFLOW.md`. |
| 21 | AI misstep | When user confirmed verify-env passed, Claude deflected KANBAN update back to user ("Mark /verify-env done then") — KANBAN.md is in docs/ and Claude's responsibility to update. | Rule: when a task completes, update KANBAN.md immediately without waiting for user to prompt. |
| 22 | AI misstep | Flagged GEMINI.md line 16 as incorrect — re-reading confirmed the heuristic was right as written. Gemini pushed back and was correct. | Rule: re-read before flagging — don't flag issues without verifying they are actually wrong. |

---

## Notes for Claude

- Default mode: guide only, no code writes
- All major features complete — project is showcase-ready
- Next session: any remaining screenshot additions, or move to new feature

---

## Notes for Gemini

- You have **full write access to the `docs/` folder** — edit files directly, do not ask the user to apply changes for you
- Scope: STATUS.md, KANBAN.md, ARCHITECTURE.md, CHATBOT_BEHAVIOR.md, and any other docs/ files
- Do NOT write code files, test files, configs, or anything outside docs/
- Do NOT create README.md files — root README.md is the source of truth, managed by Claude
- When a task says "Deliverable: docs/X.md" — create or edit that file yourself

### Edit Rules (follow strictly)
- **Do NOT mark tasks as done by editing headings** — Claude handles all task status updates in this file
- **Your only writes are deliverable content** — write to docs/X.md files, never modify task headings in STATUS.md
- **If an edit fails (old_string mismatch), stop and report the failure** — do not retry, do not loop, tell the user what failed
- **Never re-execute a completed step** — if a step produced output, move to the next step
