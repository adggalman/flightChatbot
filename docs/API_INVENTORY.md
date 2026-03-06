# API Inventory

This document provides a comprehensive inventory of all API calls made within the Flight Chatbot system, including backend routes exposed to the frontend, mock service endpoints, and internal LLM tool calls.

---

## Backend Routes (exposed to frontend)

### 1. POST /api/auth/signup
*   **Auth:** None
*   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string",
      "name": "string",
      "role": "string"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "token": "string (JWT)",
      "user": {
        "id": "string (user ID)",
        "email": "string",
        "name": "string",
        "role": "string"
      }
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
      "error": "Missing required query parameters: email, password, name."
    }
    ```
*   **Response (409 Conflict):**
    ```json
    {
      "error": "Email already exists."
    }
    ```
*   **Response (500 Internal Server Error):**
    ```json
    {
      "error": "string (error message)"
    }
    ```

### 2. POST /api/auth/login
*   **Auth:** None
*   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "string (JWT)",
      "user": {
        "id": "string (user ID)",
        "email": "string",
        "name": "string",
        "role": "string"
      }
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
      "error": "Missing required query parameters: email, password."
    }
    ```
*   **Response (401 Unauthorized):**
    ```json
    {
      "error": "Invalid email or password"
    }
    ```
*   **Response (500 Internal Server Error):**
    ```json
    {
      "error": "string (error message)"
    }
    ```

### 3. POST /api/chat
*   **Auth:** Optional (JWT). Defaults to `{ role: 'user' }` if no JWT.
*   **Request Body:**
    ```json
    {
      "message": "string (required)",
      "history": [
        {
          "sender": "user" | "model",
          "text": "string"
        }
      ]
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "reply": {
        "text": "string (LLM's response)",
        "tool_calls": [
            {
                "tool_name": "string",
                "args": "{ /* object of arguments */ }"
            }
        ],
        "function_call": "{ /* object of arguments, alternative to tool_calls */ }"
      }
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
      "error": "Message is required"
    }
    ```
*   **Response (500 Internal Server Error):**
    ```json
    {
      "error": "Failed to get response"
    }
    ```

### 4. GET /api/flights/search
*   **Auth:** None
*   **Request Query Parameters:**
    *   `origin`: string (required, IATA city/airport code)
    *   `destination`: string (required, IATA city/airport code)
    *   `departureDate`: string (YYYY-MM-DD, required)
    *   `adults`: number (optional, default 1)
*   **Response (200 OK):** Amadeus API response structure for flight offers search
*   **Response (400 Bad Request):**
    ```json
    {
      "error": "Missing required query parameters: ...",
      "example": "/api/flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&adults=1"
    }
    ```
*   **Response (4xx/5xx from Amadeus, or 500 Internal Server Error):**
    ```json
    {
      "error": "Failed to fetch flight offers.",
      "details": "string or object (Amadeus error details or internal error message)"
    }
    ```

### 5. GET /api/health
*   **Auth:** None
*   **Request Params/Body:** None
*   **Response (200 OK):**
    ```json
    {
      "status": "OK",
      "timestamp": "string (ISO 8601 format)"
    }
    ```

---

## Mock Services Routes

### 1. POST /mock-api/booking/flight-orders
*   **Auth:** `x-service-key`
*   **Request Body:**
    ```json
    {
      "data": {
        "travelers": [
          { "id": "string", "name": { "firstName": "string", "lastName": "string" } }
        ],
        "flightOffers": [
          { "id": "string", "segments": [ { "carrierCode": "string", "number": "string" } ] }
        ]
      }
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "data": {
        "type": "flight-order",
        "id": "string (generated orderId)",
        "associatedRecords": [ { "reference": "string (generated PNR)", "originSystemCode": "GDS" } ],
        "flightOffers": "array (echoed from request)",
        "travelers": "array (echoed from request)"
      }
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
      "error": "Missing travelers or flightOffers in request body"
    }
    ```
*   **Response (500 Internal Server Error):**
    ```json
    {
      "error": "Server error"
    }
    ```

### 2. GET /mock-api/booking/flight-orders?pnr=:pnr
*   **Auth:** `x-service-key`
*   **Request Query Parameters:** `pnr=string (required)`
*   **Response (200 OK):**
    ```json
    {
      "data": {
        "type": "flight-order",
        "id": "string (orderId)",
        "associatedRecords": [ { "reference": "string (PNR)", "originSystemCode": "GDS" } ],
        "flightOffers": "array",
        "travelers": "array"
      }
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
      "error": "pnr is required"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
      "error": "Order not found"
    }
    ```
*   **Response (500 Internal Server Error):**
    ```json
    {
      "error": "Server error"
    }
    ```

### 3. DELETE /mock-api/booking/flight-orders?pnr=:pnr
*   **Auth:** `x-service-key`
*   **Request Query Parameters:** `pnr=string (required)`
*   **Response (200 OK):**
    ```json
    {
      "message": "Order cancelled"
    }
    ```
*   **Response (400 Bad Request):**
    ```json
    {
      "error": "pnr is required"
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
      "error": "Order not found"
    }
    ```
*   **Response (500 Internal Server Error):**
    ```json
    {
      "error": "Server error"
    }
    ```

### 4. GET /mock-api/flights/:flightNumber/passengers
*   **Auth:** `x-service-key`
*   **Request Path Parameters:** `flightNumber=string (required)`
*   **Response (200 OK):**
    ```json
    {
      "passengers": [
        { "id": "string", "name": { "firstName": "string", "lastName": "string" } }
      ]
    }
    ```
*   **Response (404 Not Found):**
    ```json
    {
      "error": "No passengers found for this flight"
    }
    ```
*   **Response (500 Internal Server Error):**
    ```json
    {
      "error": "Server error"
    }
    ```

### 5. GET /health (Mock Service Root)
*   **Auth:** None
*   **Request Params/Body:** None
*   **Response (200 OK):**
    ```json
    {
      "status": "ok"
    }
    ```

---

## LLM Tool Calls (from `backend/services/toolExecutors.js`)

### 1. Tool Call: `search_flights`
*   **Method + Path (Internal LLM Call):** `GET ${BACKEND_URL}/api/flights/search`
*   **Auth:** None (handled by backend service)
*   **Request Params:** `origin=string`, `destination=string`, `departureDate=string`, `adults=number (optional)`
*   **Response Shape:** Amadeus flight offers search response

### 2. Tool Call: `retrieve_booking`
*   **Method + Path (Internal LLM Call):** `GET ${MOCK_SERVICE_URL}/mock-api/booking/flight-orders?pnr=:pnr`
*   **Auth:** `x-service-key`
*   **Request Params:** `pnr=string`
*   **Response Shape:** Mock service booking details

### 3. Tool Call: `cancel_booking`
*   **Method + Path (Internal LLM Call):** `DELETE ${MOCK_SERVICE_URL}/mock-api/booking/flight-orders?pnr=:pnr`
*   **Auth:** `x-service-key`
*   **Request Params:** `pnr=string`
*   **Response Shape:** Mock service response for deletion

### 4. Tool Call: `get_passengers`
*   **Method + Path (Internal LLM Call):** `GET ${MOCK_SERVICE_URL}/mock-api/flights/:flightNumber/passengers`
*   **Auth:** `x-service-key`
*   **Request Params:** `flightNumber=string`
*   **Response Shape:** Mock service passenger list

### 5. Tool Call: `create_booking`
*   **Method + Path (Internal LLM Call):** `POST ${MOCK_SERVICE_URL}/mock-api/booking/flight-orders`
*   **Auth:** `x-service-key`
*   **Request Body:** `{"data": {"travelers": [...], "flightOffers": [...]}}`
*   **Response Shape:** Mock service booking creation response