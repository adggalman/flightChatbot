# Amadeus API Endpoints for Flight Booking Chatbot

This document outlines the key Amadeus API endpoints relevant to our flight booking chatbot project, including their SDK methods, example data structures, and recommendations for mocking.

---

### 1. Flight Offers Search

-   **Purpose:** To find available flights based on search criteria like origin, destination, and date.
-   **API Endpoint:** `GET /v2/shopping/flight-offers`
-   **SDK Method:** `amadeus.shopping.flightOffersSearch.get()`
-   **Example Request (Query Parameters):**
    ```json
    {
      "originLocationCode": "JFK",
      "destinationLocationCode": "LAX",
      "departureDate": "2024-12-25",
      "adults": 1
    }
    ```
-   **Example Response (Simplified):**
    ```json
    {
      "data": [
        {
          "type": "flight-offer",
          "id": "1",
          "itineraries": [ /* ... */ ],
          "price": {
            "currency": "USD",
            "total": "250.50"
          }
        }
      ]
    }
    ```

---

### 2. Flight Offer Pricing

-   **Purpose:** To confirm the final price and availability of a specific flight offer selected from the search results. This is a mandatory step before booking.
-   **API Endpoint:** `POST /v1/shopping/flight-offers/pricing`
-   **SDK Method:** `amadeus.shopping.flightOffers.pricing.post()`
-   **Example Request (Body):**
    ```json
    {
      "data": {
        "type": "flight-offers-pricing",
        "flightOffers": [
          // The flight offer object received from the search results goes here
          { /* ... Flight Offer from Search ... */ }
        ]
      }
    }
    ```
-   **Example Response (Simplified):**
    ```json
    {
      "data": {
        "type": "flight-offers-pricing",
        "flightOffers": [
          {
            "id": "1-PRICED",
            "price": {
              "currency": "USD",
              "total": "255.75" // Price might change slightly
            }
          }
        ]
      }
    }
    ```

---

### 3. Flight Create Orders (Booking)

-   **Purpose:** To book a flight and create a PNR (Passenger Name Record). This is a state-changing action.
-   **API Endpoint:** `POST /v1/booking/flight-orders`
-   **SDK Method:** `amadeus.booking.flightOrders.post()`
-   **Example Request (Body, Simplified):**
    ```json
    {
      "data": {
        "type": "flight-order",
        "flightOffers": [
          // The priced flight offer from the pricing step goes here
          { /* ... Priced Flight Offer ... */ }
        ],
        "travelers": [
          {
            "id": "1",
            "name": {
              "firstName": "John",
              "lastName": "Doe"
            },
            "contact": {
              "emailAddress": "john.doe@example.com"
            }
            // ... other traveler details
          }
        ]
      }
    }
    ```
-   **Example Response (Simplified):**
    ```json
    {
      "data": {
        "type": "flight-order",
        "id": "ORDER-1234",
        "associatedRecords": [
          {
            "reference": "ABCDEF", // This is the PNR
            "originSystemCode": "GDS"
          }
        ]
      }
    }
    ```

---

### 4. Flight Order Management (Retrieve Booking)

-   **Purpose:** To retrieve the details of an existing booking using its Order ID.
-   **API Endpoint:** `GET /v1/booking/flight-orders/{flightOrderId}`
-   **SDK Method:** `amadeus.booking.flightOrder('ORDER-1234').get()`
-   **Example Request:** The `flightOrderId` is part of the URL/method call.
-   **Example Response:** The response structure is very similar to the create order response, containing all traveler and flight details.

---

### 5. Airport & City Search (Autocomplete)

-   **Purpose:** To find airport codes and city names based on a keyword. Useful for a chatbot's user interface.
-   **API Endpoint:** `GET /v1/reference-data/locations`
-   **SDK Method:** `amadeus.referenceData.locations.get()`
-   **Example Request (Query Parameters):**
    ```json
    {
      "subType": "CITY,AIRPORT",
      "keyword": "New York"
    }
    ```
-   **Example Response (Simplified):**
    ```json
    {
      "data": [
        {
          "name": "NEW YORK",
          "iataCode": "JFK",
          "subType": "AIRPORT"
        },
        {
          "name": "NEW YORK",
          "iataCode": "LGA",
          "subType": "AIRPORT"
        }
      ]
    }
    ```

---

## Mocking Recommendations

For our chatbot project, we should **not** call the Amadeus API for every action, especially during automated testing or for actions that are difficult to replicate.

The following endpoints make sense to **mock**:

1.  **Flight Create Orders (Booking):**
    -   **Reason:** This is the most important one to mock. It's a state-changing action that creates a real (test) booking. Repeatedly hitting this endpoint during testing is inefficient and can pollute the test environment.
    -   **Mock Behavior:** The mock service should accept a valid traveler and flight offer, and return a fake but valid-looking booking confirmation with a PNR.

2.  **Flight Order Management (Retrieve Booking):**
    -   **Reason:** This endpoint depends on a booking having been created first. Mocking it allows us to test the "view my booking" feature with a consistent, predictable PNR without having to create a real booking each time.
    -   **Mock Behavior:** The mock service should accept a PNR and return a consistent, hard-coded flight order detail object.

3.  **Custom/Non-Amadeus Flows (e.g., "Move Passenger"):**
    -   **Reason:** Amadeus doesn't have a simple "move passenger" API. This will be a custom feature specific to our mock services to showcase complex interactions.
    -   **Mock Behavior:** The mock service will need its own internal logic to "move" a passenger from one flight's passenger list to another. This will involve creating mock endpoints like `GET /mock-api/flights/:flightNumber/passengers` and `POST /mock-api/passengers/move`.

**Live API Calls:**

-   **Flight Offers Search** and **Airport & City Search** are safe to call against the live Amadeus test API as they are read-only (idempotent) and do not change any state.
-   **Flight Offer Pricing** is also generally safe to call live.
