# Project Status

Handoff document between Claude (implementation guidance) and Gemini (documentation/architecture). Claude updates this after each session. Gemini reads this before working on docs tasks.

---

## Current Sprint

**Goal:** Polish and showcase readiness.

**Last completed (2026-02-22):**
- create_booking end-to-end verified — real PNR returned from MongoDB (e.g. 3LIWAO7DUB0K), no hallucination
- SERVICE_API_KEY mismatch between backend and mock-services Vercel envs — fixed
- Anti-hallucination rules added to Gemini system prompt (never invent PNRs, always use tools)
- Android nav bar overlap fixed — useSafeAreaInsets + removed duplicate SafeAreaProvider
- Backend missing security packages fixed in package.json (helmet, rate-limit, hpp, mongo-sanitize, validator)
- express-rate-limit trust proxy error fixed (app.set('trust proxy', 1))
- Vercel main branch auto-deploy fixed — ignoreCommand was blocking production builds, removed
- optionalAuth middleware on /api/chat — anonymous users get role:'user', no 401

**Up next:**
1. LLM: Present PNR to user after booking (not internal orderId)
2. Booking: Retrieve/cancel by PNR + email (not orderId)
3. UX research: Study Singapore Airlines Kris chatbot as benchmark
4. CI: Trigger Cucumber tests on deployment_status event (avoid flaky results)
5. ARCHITECTURE.md diagram fix (Gemini task — see below)

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

### Task 4 — Final README review

Read the full README.md and check:
- All links are correct and working
- The boilerplate branch callout at the top is present
- Step 11 (Linear) is marked as complete (not "In Progress")
- The `runs.html` link is listed in the Live Links section
- GitHub Actions secrets list is complete and accurate

---

## Notes for Claude

- Default mode: guide only, no code writes
- All major features complete — project is showcase-ready
- Next session: any remaining screenshot additions, or move to new feature
