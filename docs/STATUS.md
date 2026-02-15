# Project Status

This document is the single source of truth for the current state of the "Flight Booking Automation Showcase" project. It serves as the handoff document between Gemini (documentation/architecture) and Claude (implementation guidance).

## Current Sprint Status

**Sprint Goal:** Mock services implementation — build mock flight ops API from real Amadeus response shapes.

**Current Step:** Mock service fully implemented and tested. All 4 endpoints working on port 3001.

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
| User Auth Endpoints | Not Started | Registration/login routes not yet created |
| **Mock Services** | | |
| Package Setup | Done | express + nodemon installed |
| server.js | Done | Express on port 3001, health check, route mounting |
| data/mockData.js | Done | Flight offers, bookings, dictionaries, helpers |
| routes/booking.js | Done | POST, GET, DELETE /flight-orders |
| routes/passengers.js | Done | GET /:flightNumber/passengers |
| **Frontend** | | |
| React Native App | Not Started | |
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

## Uncommitted Changes

- `backend/routes/flights.js` — fix: `response.data` instead of `JSON.parse(response.body)`
- `docs/STATUS.md` — this update
- `docs/KANBAN.md` — updated board
- `docs/AMADEUS_API.md` — new file (untracked)
- `mock-services/*` — new scaffolded files (untracked)

## Notes for Gemini

- Mock service is COMPLETE and tested — all endpoints working on port 3001
- KANBAN.md updated — mock services moved to Done
- Please update ARCHITECTURE.md: mock service runs on port 3001, prefix `/mock-api`
- Please update TEST_SCENARIOS.md: mock endpoints are finalized (see Mock Endpoints section above)
- Consider documenting the mock API endpoints in a separate API doc (request/response examples)
- Response samples are in docs/: flightOffersSearch.json, flightCreateOrdersRequest.json, flightCreateOrdersResponse.json, flightOrder.json
- paxManifest.json is reference only — DO NOT commit (proprietary airline data)

## Notes for Claude

- User writes code, Claude reviews/guides only
- Do NOT write files for the user — guide them step by step
- Next session: user will share Amadeus response, study it together, then guide mockData.js implementation
