# High-Level Architecture Diagram

This diagram illustrates the main components of the Flight Booking Automation Showcase and how they interact.

```
+-----------------+      +-------------------------+      +---------------------+
|                 |      |                         |      |                     |
|  React Native   |----->|     Backend Service     |----->|   MongoDB Atlas     |
| (Expo) Frontend |      | (Node/Express/Gemini AI)|      |      (Database)     |
|                 |      |                         |      |                     |
+-----------------+      +-----------+-------------+      +---------------------+
       ^                             |
       |                             |
       v                             +----------------------+
+-----------------+                  |                      |
|                 |                  v                      v
|  Appium Tests   |      +-------------------------+      +---------------------+
| (Cucumber.js)   |      |   Mock Flight Ops API   |      |  Amadeus Travel API |
|                 |      |      (Node/Express)     |      | (External Service)  |
+-----------------+      +-------------------------+      +---------------------+
```

-   **React Native (Expo) Frontend:** The user-facing mobile application for Android. It communicates with the Backend Service for all data and operations.
-   **Appium Tests (Cucumber.js):** These are the automated end-to-end tests that drive the React Native application, simulating user behavior and verifying functionality. They are written in Gherkin syntax (feature files) and implemented with Cucumber.js.
-   **Backend Service (Node/Express/Gemini AI):** The core of the application. It integrates with Gemini for AI-powered chat, handles business logic, user authentication, and proxies requests to external services.
-   **MongoDB Atlas (Database):** A cloud-hosted NoSQL database used to store user data, bookings, and other application-specific information.
-   **Amadeus Travel API (External Service):** A third-party API that provides real-time flight information, including search results, pricing, and availability.
-   **Mock Flight Ops API (Node/Express):** A custom-built mock service that simulates airline-specific operations not available in the live Amadeus API, such as fetching a passenger list or managing mock bookings.
