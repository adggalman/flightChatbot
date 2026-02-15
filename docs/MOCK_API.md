# Mock Flight Booking API

This document outlines the endpoints available in the mock service, which runs on port 3001 and uses the `/mock-api` prefix. It simulates the behavior of the Amadeus booking API for testing purposes.

---

### 1. Create Flight Order

Creates a new mock flight booking. The mock service will generate a unique `id` and `pnr`, and store the booking in memory for the duration of the session. The response echoes back the `flightOffers` and `travelers` from the request.

-   **Method:** `POST`
-   **URL:** `/mock-api/flight-orders`

#### Example Request Body

```json
{
    "data": {
      "type": "flight-order",
      "flightOffers": [
          {
            "type": "flight-offer",
            "id": "1",
            "source": "GDS",
            "nonHomogeneous": false,
            "lastTicketingDate": "2026-02-28"
          }
      ],
      "travelers": [
        {
          "id": "1",
          "dateOfBirth": "1982-01-16",
          "name": { "firstName": "JORGE", "lastName": "GONZALES" },
          "gender": "MALE",
          "contact": { "emailAddress": "jorge.gonzales833@telefonica.es" },
          "documents": [
            { "documentType": "PASSPORT", "number": "00000000", "expiryDate": "2026-04-14", "nationality": "ES" }
          ]
        }
      ]
    }
}
```

#### Example Success Response (200 OK)

```json
{
    "data": {
        "type": "flight-order",
        "id": "eJzTd9e3DHMMCQoBAAstAnA",
        "queuingOfficeId": "NCE4D31SB",
        "associatedRecords": [
            { "reference": "9VATRT", "originSystemCode": "MOCK" }
        ],
        "flightOffers": [
            {
                "type": "flight-offer",
                "id": "1",
                "source": "GDS",
                "nonHomogeneous": false,
                "lastTicketingDate": "2026-02-28"
            }
        ],
        "travelers": [
            {
                "id": "1",
                "dateOfBirth": "1982-01-16",
                "gender": "MALE",
                "name": { "firstName": "JORGE", "lastName": "GONZALES" }
            }
        ]
    }
}
```

---

### 2. Retrieve Flight Order

Retrieves a mock flight booking by its `id`.

-   **Method:** `GET`
-   **URL:** `/mock-api/flight-orders/:id`

#### URL Parameters
-   `id` (string, required): The ID of the flight order to retrieve (e.g., `eJzTd9e3DHMMCQoBAAstAnA`).

#### Example Success Response (200 OK)

```json
{
    "meta": {
        "count": 1,
        "links": {
            "self": "https://test.api.amadeus.com/v1/booking/flight-orders/eJzTd9e3DHMMCQoBAAstAnA"
        }
    },
    "data": {
        "type": "flight-order",
        "id": "eJzTd9e3DHMMCQoBAAstAnA",
        "associatedRecords": [
            { "reference": "9VATRT", "originSystemCode": "MOCK" }
        ],
        "flightOffers": [
            {
                "type": "flight-offer",
                "id": "1",
                "itineraries": [
                    {
                        "segments": [
                            { "carrierCode": "6X", "number": "3618" },
                            { "carrierCode": "6X", "number": "3605" }
                        ]
                    }
                ]
            }
        ],
        "travelers": [
            { "id": "1", "name": { "firstName": "JORGE", "lastName": "GONZALES" } }
        ]
    }
}
```

#### Example Error Response (404 Not Found)

```json
{
  "error": "Booking with ID eJzTd9e3DHMMCQoBAAstAnA not found."
}
```

---

### 3. Delete Flight Order

Deletes (cancels) a mock flight booking by its `id`.

-   **Method:** `DELETE`
-   **URL:** `/mock-api/flight-orders/:id`

#### URL Parameters
-   `id` (string, required): The ID of the flight order to delete.

#### Example Success Response (200 OK)

```json
{
  "message": "Booking with ID eJzTd9e3DHMMCQoBAAstAnA successfully deleted."
}
```

---

### 4. Get Passenger List by Flight

Retrieves a list of all passengers for a specific flight number by searching through all created bookings.

-   **Method:** `GET`
-   **URL:** `/mock-api/flights/:flightNumber/passengers`

#### URL Parameters
-   `flightNumber` (string, required): The flight identifier (e.g., `6X3618`).

#### Example Success Response (200 OK)

```json
{
    "flight": "6X3618",
    "passengerCount": 1,
    "passengers": [
        {
          "id": "1",
          "dateOfBirth": "1982-01-16",
          "name": { "firstName": "JORGE", "lastName": "GONZALES" },
          "gender": "MALE",
          "contact": { "emailAddress": "jorge.gonzales833@telefonica.es" },
          "documents": [
            { "documentType": "PASSPORT", "number": "00000000", "expiryDate": "2026-04-14", "nationality": "ES" }
          ]
        }
    ]
}
```

#### Example Error Response (404 Not Found)

```json
{
  "message": "No passengers found for flight 6X3618."
}
```
