# Project Status

This document is the single source of truth for the current state of the "Flight Booking Automation Showcase" project. It serves as the handoff document between Gemini (documentation/architecture) and Claude (implementation).

## Current Sprint Status

**Sprint Goal:** Initial project setup and backend foundation.

**Key Tasks:**
- Set up backend server with Express.js.
- Establish MongoDB connection.
- Define initial API endpoints for flight search.
- Implement basic authentication structure.

## Built Components

| Component | Status | Notes |
|---|---|---|
| **Backend** | | |
| Express Server | Not Started | |
| MongoDB Connection | Not Started | |
| **Frontend** | | |
| React Native App | Not Started | |
| **Mock Services** | | |
| Flight Operations API | Not Started | |

## Available Endpoints & Schemas

*This section will be populated as Claude implements the APIs.*

### Authentication API

-   **POST /api/auth/register**
    -   **Description:** Register a new user.
    -   **Request Body Schema:**
        ```json
        {
          "email": "user@example.com",
          "password": "securepassword123",
          "fullName": "Test User"
        }
        ```
    -   **Response:** JWT Token

-   **POST /api/auth/login**
    -   **Description:** Log in an existing user.
    -   **Request Body Schema:**
        ```json
        {
          "email": "user@example.com",
          "password": "securepassword123"
        }
        ```
    -   **Response:** JWT Token

### Flight Search API (Amadeus Proxy)

-   **GET /api/flights/search**
    -   **Description:** Search for flights (proxied to Amadeus API).
    -   **Query Parameters:**
        -   `originLocationCode` (string, required)
        -   `destinationLocationCode` (string, required)
        -   `departureDate` (string, required, format: YYYY-MM-DD)
        -   `adults` (integer, required)
    -   **Response:** Flight offers from Amadeus.

## Notes for Claude

- Please prioritize setting up the backend server and the database connection first.
- Once the server is running, we can start implementing the user registration and login endpoints.
- For the flight search, we will initially just proxy the request to the Amadeus API.
