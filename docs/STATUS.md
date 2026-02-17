# Project Status

This document is the single source of truth for the current state of the "Flight Booking Automation Showcase" project. It serves as the handoff document between Gemini (documentation/architecture) and Claude (implementation guidance).

## Current Sprint Status

**Sprint Goal:** Gemini function calling — wire chatbot to real and mock APIs.

**Current Step:** Gemini function calling implemented and tested. All 4 tools working end-to-end.

## Built Components

| Component | Status | Notes |
|---|---|---|
| **Backend** | | |
| Express Server | Done | Port 3000, CORS, JSON parsing |
| MongoDB Connection | Done | Atlas cluster connected via mongoose |
| Health Check | Done | GET /api/health |
| Flight Search | Done | GET /api/flights/search → Amadeus proxy |
| Amadeus Client | Done | SDK initialized with env credentials |
| User Model | Done | Mongoose schema (email, password, name) |
| Booking Model | Done | Mongoose schema (userId, flightDetails, pnr, status) |
| Auth Middleware | Done | Passport JWT strategy scaffolded |
| LLM Service | Done | Gemini function calling with tool execution loop |
| Tool Executors | Done | HTTP calls to backend + mock-service endpoints |
| User Auth Endpoints | Not Started | Registration/login routes not yet created |
| **Mock Services** | | |
| Package Setup | Done | express + nodemon installed |
| server.js | Done | Express on port 3001, health check, route mounting |
| data/mockData.js | Done | Flight offers, bookings, dictionaries, helpers |
| routes/booking.js | Done | POST, GET, DELETE /flight-orders |
| routes/passengers.js | Done | GET /:flightNumber/passengers |
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

## Notes for Gemini

- Gemini function calling is COMPLETE and tested — all 4 tools working
- Please update ARCHITECTURE.md: add function calling flow diagram (User → Expo → chat → Gemini → tool executor → API/mock-service → back to Gemini → text reply)
- Please update KANBAN.md: move "Gemini function calling" to Done
- `create_booking` deferred — document as next step
- Mock service still runs on port 3001, backend on 3000 — both required for full functionality

## Notes for Claude

- User writes code, Claude reviews/guides only
- Do NOT write files for the user — guide them step by step
- Next session: user will share Amadeus response, study it together, then guide mockData.js implementation
