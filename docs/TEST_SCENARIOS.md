# Test Scenario Outlines

This document outlines the high-level test scenarios for the main user flows of the application. These are not feature files, but rather a guide for Claude to use when writing the actual Cucumber tests.

---

### 1. Flight Search

**Objective:** Verify that a user can successfully search for flights and see a list of results.

**Scenario: Successful Flight Search**
- **Given** the user is on the flight search screen
- **When** the user enters a valid origin (e.g., "JFK")
- **And** the user enters a valid destination (e.g., "LAX")
- **And** the user selects a future departure date
- **And** the user specifies the number of adults
- **And** the user taps the "Search" button
- **Then** the user should see a list of available flights matching the criteria

**Scenario: No Flights Found**
- **Given** the user is on the flight search screen
- **When** the user enters a valid but obscure origin/destination pair
- **And** the user selects a future departure date
- **And** the user taps the "Search" button
- **Then** the user should see a message indicating that no flights were found

**Scenario: Invalid Search Criteria**
- **Given** the user is on the flight search screen
- **When** the user leaves the origin field blank
- **And** the user taps the "Search" button
- **Then** the user should see an error message prompting for an origin

---

### 2. Flight Booking

**Objective:** Verify that a logged-in user can book a flight.

**Pre-condition:** User is logged in.

**Scenario: Successful Booking**
- **Given** the user has searched for flights and is on the results screen
- **When** the user selects a flight from the list
- **And** the user is taken to the traveler details screen
- **And** the user enters their personal information (name, contact info)
- **And** the user confirms the booking
- **Then** the user should see a booking confirmation screen with a PNR
- **And** the booking should be saved in the user's account

---

### 3. Manage Booking

**Objective:** Verify that a user can retrieve and view their booking details.

**Pre-condition:** User is logged in and has a previous booking.

**Scenario: Retrieve and View Booking**
- **Given** the user is on the "My Bookings" screen
- **When** the user enters their PNR from a previous booking
- **And** the user taps "Find Booking"
- **Then** the user should see the details of their flight booking

**Scenario: Cancel Booking**
- **Given** the user is viewing the details of a booking
- **When** the user taps the "Cancel Booking" button
- **And** the user confirms the cancellation
- **Then** the booking status should be updated to "Cancelled"
- **And** the user should see a confirmation message

---

### 4. Flight Status Check

**Objective:** Verify that anyone can check the status of a flight.

**Scenario: Check Flight Status by Flight Number**
- **Given** the user is on the flight status screen
- **When** the user enters a valid flight number
- **And** the user taps "Check Status"
- **Then** the user should see the flight's status (e.g., "On Time", "Delayed"), departure gate, and arrival gate.

---

### 5. Change Flight (Admin/Mock API Flow)

**Objective:** Verify that a passenger's flight can be changed. This is an internal-facing feature that uses the mock booking endpoints.

**Scenario: Successfully Change a Passenger's Flight**
- **Given** a passenger is booked on a specific flight (Flight A) with booking ID "ORDER-123"
- **When** a `DELETE` request is made to `/mock-api/flight-orders/ORDER-123`
- **Then** the booking for "ORDER-123" is successfully cancelled

- **When** a `POST` request is made to `/mock-api/flight-orders` with the same traveler details but new flight offers for Flight B
- **Then** a new booking is created for the passenger on Flight B
- **And** a call to `GET /mock-api/flights/FLIGHT-A-NUMBER/passengers` should no longer include the passenger
- **And** a call to `GET /mock-api/flights/FLIGHT-B-NUMBER/passengers` should now include the passenger
