# Project Status

Handoff document between Claude (implementation guidance) and Gemini (documentation/architecture). Claude updates this after each session. Gemini reads this before working on docs tasks.

---

## Current Sprint

**Goal:** Complete Linear CI integration → Allure history → Boilerplate branch → README final pass

**Last completed:** Linear post-processing integration — tickets auto-created on manual CI trigger, Allure results patched with Linear issue links.

**In progress:** Verifying CI Linear integration (manual trigger running now)

**Up next:**
1. Allure history (carry `history/` folder across CI runs on gh-pages)
2. Boilerplate branch setup
3. README final pass (Gemini task — see below)

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
| Tool Executors | ✅ Done | HTTP calls to backend + mock-service endpoints |
| Chat Endpoint | ✅ Done | POST /api/chat — protected, rate-limited 20/15min |
| **Mock Services** | | |
| server.js | ✅ Done | Express port 3001, MongoDB before listen |
| config/db.js | ✅ Done | Async connectDB() with error handling |
| models/MockFlightOrder.js | ✅ Done | orderId + orderData (Mixed) + timestamps |
| scripts/seed.js | ✅ Done | Idempotent seed for MOCK-ORDER-1001 |
| data/mockData.js | ✅ Done | Flight offers, dictionaries, helpers (no bookings array) |
| routes/booking.js | ✅ Done | POST/GET/DELETE /flight-orders (MongoDB) |
| routes/passengers.js | ✅ Done | GET /:flightNumber/passengers (MongoDB) |
| Service Auth | ✅ Done | x-service-key header on all mock routes |
| **Frontend** | | |
| Expo Chat Screen | ✅ Done | Wired to POST /api/chat |
| Loading animation | ✅ Done | Disabled send during bot reply |
| **Deployment** | | |
| Backend on Vercel | ✅ Done | https://flightchatbot.vercel.app |
| Mock Services on Vercel | ✅ Done | https://mock-services-beta.vercel.app |
| **Automation** | | |
| Cucumber scaffold | ✅ Done | Features, step defs, helpers, hooks |
| Feature files | ✅ Done | health, chat, booking, passengers, happy-path flow |
| Step definitions | ✅ Done | backendSteps.js, mockSteps.js, flowSteps.js |
| apiHelpers.js | ✅ Done | Axios clients for backend + mock-service |
| Test data cleanup | ✅ Done | After hook deletes created orders in MongoDB |
| Tag conventions | ✅ Done | @api-contracts, @happy-path, @local, @wip |
| Allure reporting | ✅ Done | allure-cucumberjs, report:open, GitHub Pages |
| GitHub Actions | ✅ Done | Push/PR auto-run + manual dispatch |
| **Linear Integration** | | |
| linearHelper.js | ✅ Done | GraphQL: createLabel, createIssue, updateIssueStatus, addComment |
| cucumber-to-linear.js | ✅ Done | Post-processing script — reads cucumber-report.json, creates tickets, patches allure results |
| CI flag | ✅ Done | workflow_dispatch boolean `create_linear_tickets` |
| Allure ↔ Linear link | ✅ Done | Allure result JSON patched with Linear issue URL |
| **Pending** | | |
| Allure history | ⏳ Pending | Carry history/ folder across CI runs |
| Boilerplate branch | ⏳ Pending | Empty scaffold for learners |

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
└── Deploy → GitHub Pages (https://adggalman.github.io/flightChatbot/)
```

---

## Linear Integration — How It Works

**Pattern:** Post-processing (mirrors AirAsia Xray CI pattern)

```
CI run → npm test → cucumber-report.json
       → npm run linear (if create_linear_tickets=true)
           ├── Creates run label: ci-#N or local-YYYY-MM-DD-HH:MM
           ├── Per scenario: createIssue → updateIssueStatus (Done/Cancelled)
           └── Patches allure-results/*.json with Linear issue link
       → npm run report (picks up patched allure results)
       → Deploy to GitHub Pages (Allure shows Linear link in test detail)
```

**Key files:**
- `automation/scripts/cucumber-to-linear.js` — main post-processor
- `automation/src/helpers/linearHelper.js` — GraphQL API wrapper
- `automation/src/support/hooks.js` — logging only (Linear removed)
- `.github/workflows/cucumber-tests.yml` — Linear step between test + report

**Env vars needed:** LINEAR_API_KEY, LINEAR_TEAM_ID, LINEAR_STATE_IN_PROGRESS, LINEAR_STATE_DONE, LINEAR_STATE_CANCELED

---

## Allure History (Next Claude Task)

**Problem:** Each CI run deploys a fresh Allure report — no trend history.

**Fix:** Before `npm run report`, copy `history/` from the previous gh-pages deployment into `allure-results/history/`. Allure picks it up automatically.

**Workflow change needed in `cucumber-tests.yml`:**
1. Checkout gh-pages branch into a temp folder
2. Copy `gh-pages/history → allure-results/history/` (safe to fail on first run)
3. Then run `npm run report` as usual

---

## Gemini TODO

These are discrete, specific tasks. Do NOT copy-paste from this file into README — interpret and write in your own words with proper markdown formatting.

### Task 1 — Update README: Linear Integration section

Add a new section to README.md called `## Linear Integration` after the CI/CD section. Include:
- What Linear is and why it's used (project tracking, auto ticket management)
- The post-processing pattern (diagram or numbered steps): tests run → cucumber-report.json → script creates tickets → status auto-updated → Allure report linked
- Screenshot placeholder: `![Linear tickets grouped by run label](docs/screenshots/linear-tickets.png)` (placeholder, user will add screenshot)
- How to trigger: GitHub Actions → Cucumber Tests → Run workflow → check "Create Linear tickets"
- The label convention: `ci-#N` for CI runs, `local-YYYY-MM-DD-HH:MM` for local runs
- Link to Allure report showing the Linear issue link in test detail

### Task 2 — Update README: QA Showcase Highlights section

The current highlights list is incomplete. Rewrite it to include:
- BDD feature files (Gherkin) — API contracts + E2E happy-path flow
- Reusable step definitions with generic status/body assertions
- Auto-cleanup of test data via Cucumber After hooks (prevents DB pollution)
- On-demand Linear ticket creation + auto status update via GraphQL API
- Allure ↔ Linear bidirectional linking (test report links to ticket, ticket links to report)
- Run-labeled grouping in Linear (each CI run gets its own label)
- Environment-aware tagging (`@local`, `@wip`) — rate-limit test excluded from CI
- Allure report published to GitHub Pages on every CI push

### Task 3 — Update README: Step 11 (Linear)

In the "How We Built This" section, Step 11 currently says "(In Progress)". Update it to Done and expand:
- Chose post-processing over hooks-based approach (mirrors AirAsia Xray pattern)
- `linearHelper.js` — GraphQL mutations with variables (not string interpolation — avoids injection)
- `cucumber-to-linear.js` — reads cucumber-report.json, creates tickets, patches allure result JSON files
- `workflow_dispatch` boolean flag for on-demand ticket creation (not on every push)
- Allure result patching adds `links` array to result JSON → shows as "Links" in Allure report

### Task 4 — Fix ARCHITECTURE.md diagram

The ASCII diagram in `docs/ARCHITECTURE.md` has two bugs to fix:

1. The middle box is labeled `(Proxy)` — change it to `Backend Service` (it's the same backend, no need for a separate proxy box). The correct flow is: Backend → Gemini LLM → toolExecutors → Amadeus API. Redraw to show this clearly.
2. The `Mock Flight Ops API` box is missing its closing `+-----+` border line — the box is incomplete.
3. The bullet-point descriptions at the bottom are accidentally inside the code block (before the closing triple-backtick) — move them outside.

Correct architecture flow for the diagram:
```
Mobile (Expo) → Backend (Express)
                    ├── Gemini AI (function calling) → Amadeus Travel API
                    ├── MongoDB Atlas
                    └── Mock Services (Express) → MongoDB Atlas
Cucumber.js Tests → Backend + Mock Services (API contract tests)
GitHub Actions → Allure → GitHub Pages
```

### Task 5 — Review and clean up README top section

Check that the README currently has:
- The `⚠️ Start from the boilerplate branch` callout at the top
- Live links section with current URLs
- Correct GitHub Actions badge (if badge exists, verify URL is correct)

If any of these are missing or outdated, fix them.

---

## Notes for Claude

- Default mode: guide only, no code writes
- Allure history is next implementation task
- After Allure history: boilerplate branch setup
- Linear integration is complete — update MEMORY.md after confirming CI works
