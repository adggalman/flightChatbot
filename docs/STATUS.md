# Project Status

This document is the single source of truth for the current state of the "Flight Booking Automation Showcase" project. It serves as the handoff document between Gemini (documentation/architecture) and Claude (implementation guidance).

## Current Sprint Status

**Sprint Goal:** Test automation framework — Cucumber.js + Allure + GitHub Actions + Linear.

**Current Step:** Scaffold complete. Feature files written. Health check step definitions passing. Next: chat step definitions (handle Axios 4xx/5xx with try/catch).

## Built Components

| Component | Status | Notes |
|---|---|---|
| **Backend** | | |
| Express Server | Done | Port 3000, CORS, JSON parsing, helmet/hpp/rate-limit added |
| MongoDB Connection | Done | Atlas cluster connected via mongoose |
| Health Check | Done | GET /api/health |
| Flight Search | Done | GET /api/flights/search → Amadeus proxy |
| Amadeus Client | Done | SDK initialized with env credentials |
| User Model | Done | Mongoose schema (email, password, name, role) + bcrypt hashing + comparePassword |
| Booking Model | Done | Mongoose schema (userId, flightDetails, pnr, status) |
| Auth Middleware | Done | Passport JWT strategy + requireAuth + requireRole('agent') |
| LLM Service | Done | Gemini function calling with tool execution loop |
| Tool Executors | Done | HTTP calls to backend + mock-service endpoints |
| User Auth Endpoints | Done | POST /api/auth/signup + POST /api/auth/login, JWT with 7d expiry |
| **Mock Services** | | |
| Package Setup | Done | express + nodemon installed |
| server.js | Done | Express on port 3001, connects MongoDB before listen |
| config/db.js | Done | Async connectDB() with error handling |
| models/mockFlightOrders.js | Done | MockFlightOrder schema (orderId + orderData Mixed) |
| scripts/seed.js | Done | Idempotent seed for MOCK-ORDER-1001 |
| data/mockData.js | Done | Flight offers, dictionaries, helpers (bookings removed) |
| routes/booking.js | Done | POST, GET, DELETE /flight-orders (MongoDB) |
| routes/passengers.js | Done | GET /:flightNumber/passengers (MongoDB) |
| **Frontend** | | |
| Expo Chat Screen | Done | Wired to POST /api/chat |
| React Native App | Done | Expo scaffold with chat UI |
| **Automation** | | |
| Cucumber Features | Not Started | |
| Step Definitions | Not Started | |
| Appium Config | Not Started | |

## Amadeus Response Shapes (captured in docs/)

| File | Endpoint | Notes |
|---|---|---|
| `flightOffersSearch.json` | GET /v2/shopping/flight-offers | SYD→BKK, 2 adults, 5 results |
| `flightCreateOrdersRequest.json` | POST /v1/booking/flight-orders (req) | Traveler shape with documents |
| `flightCreateOrdersResponse.json` | POST /v1/booking/flight-orders (res) | Adds order ID, PNR, co2 |
| `flightOrder.json` | GET /v1/booking/flight-orders/:id | Adds bookingStatus, isFlown |
| `paxManifest.json` | Internal airline API (reference only) | DO NOT COMMIT — proprietary |

## Mock Endpoints (Final)

1. `POST /mock-api/booking/flight-orders` — create order
2. `GET /mock-api/booking/flight-orders/:id` — retrieve order
3. `DELETE /mock-api/booking/flight-orders/:id` — cancel order
4. `GET /mock-api/flights/:flightNumber/passengers` — passenger list (custom)

**Move/change flight** = delete order → search (live Amadeus) → create new order. No custom endpoint needed.

## Workflow for Mock Data

1. ~~User calls real Amadeus Flight Offers Search via Postman~~ Done
2. ~~User and Claude study the response shape together~~ Done
3. ~~User builds mockData.js using real response as template~~ Done
4. ~~User implements mock routes (booking, passengers)~~ Done
5. ~~User implements server.js to wire it all together~~ Done

## Gemini Function Calling (New)

**Tools wired (4):**
- `search_flights` → calls `GET /api/flights/search` (Amadeus, same backend)
- `retrieve_booking` → calls `GET /mock-api/booking/flight-orders/:id` (mock-service)
- `cancel_booking` → calls `DELETE /mock-api/booking/flight-orders/:id` (mock-service)
- `get_passengers` → calls `GET /mock-api/flights/:flightNumber/passengers` (mock-service)

**Deferred:** `create_booking` — needs flight offer ID + traveler details, will add once pattern is solid.

**Files:**
- `backend/services/llmService.js` — tool schemas + execution loop (max 5 iterations)
- `backend/services/toolExecutors.js` — HTTP calls to backend + mock-service
- System prompt includes dynamic date so Gemini knows current year

## User Auth (New)

**Endpoints:**
- `POST /api/auth/signup` — creates user, returns JWT (accepts optional `role: 'agent'`)
- `POST /api/auth/login` — validates credentials, returns JWT

**JWT payload:** `{ id, role }` — 7-day expiry, signed with JWT_SECRET

**Roles:** `user` (default), `agent` — enforced via `requireRole()` middleware

**Files:**
- `backend/routes/auth.js` — signup + login routes
- `backend/models/User.js` — role field, bcrypt pre-save hook, comparePassword method
- `backend/middleware/auth.js` — requireAuth (Passport JWT) + requireRole
- `backend/server.js` — passport.initialize() + auth route mounting

**Next steps:**
1. Deploy backend, mock services, and frontend to Vercel (free tier)

## Vercel Deployment Plan (In Progress)

### Step-by-step order
1. **MongoDB Atlas** — set Network Access to allow all IPs (`0.0.0.0/0`) for Vercel dynamic IPs ← NEXT
2. **Deploy backend** to Vercel — get deployed URL
3. **Deploy mock-services** to Vercel — get deployed URL
4. **Add env vars to Vercel** for each service (see list below)
5. **Update frontend** API URL to point to deployed backend
6. **Deploy frontend** to Vercel
7. **CORS lock-down** — update backend CORS config with real frontend domain

### Files added for Vercel
- `backend/vercel.json` — routes all requests to server.js via @vercel/node
- `mock-services/vercel.json` — same pattern
- Both `server.js` files now export `app` (`module.exports = app`) at the bottom

### Environment variables needed (Vercel dashboard)

**Backend:**
- `MONGODB_URI`
- `JWT_SECRET`
- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `MOCK_SERVICE_URL` ← set after mock-services is deployed
- `SERVICE_API_KEY`

**Mock Services:**
- `MONGODB_URI`
- `SERVICE_API_KEY`

### URL wiring
- `backend/services/toolExecutors.js` already uses `process.env.BACKEND_URL` and `process.env.MOCK_SERVICE_URL` with localhost fallbacks — no code change needed, just set env vars in Vercel

## Notes for Gemini

- Vercel deployment in progress — do NOT update KANBAN until deployment is confirmed working
- Security hardening added to backend: helmet, hpp, express-rate-limit (100 req/15min on /api)
- mock-services does NOT use security middleware — internal service protected by SERVICE_API_KEY only
- CLAUDE.md in project root enforces guide-only mode for Claude

## Notes for Claude

- User writes code, Claude reviews/guides only
- Do NOT write files for the user — guide them step by step
- Resume Vercel deployment: next step is MongoDB Atlas IP whitelist, then `vercel deploy` from backend/
