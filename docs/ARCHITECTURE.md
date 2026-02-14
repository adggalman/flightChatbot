# High-Level Architecture Diagram

This diagram illustrates the main components of the Flight Booking Automation Showcase and how they interact.

```
+-----------------+      +---------------------+      +---------------------+
|                 |      |                     |      |                     |
|  React Native   |----->|   Backend Service   |----->|   MongoDB Atlas     |
| (Expo) Frontend |      |    (Node/Express)   |      |      (Database)     |
|                 |      |                     |      |                     |
+-----------------+      +----------+----------+      +---------------------+
       ^                           |
       |                           |
       v                           |
+-----------------+                |
|                 |                |
|  Appium Tests   |                |
| (Cucumber.js)   |                |
|                 |                |
+-----------------+                v
                           +---------------------+      +---------------------+
                           |                     |      |                     |
                           |   (Proxy)           |----->|  Amadeus Travel API |
                           |                     |      | (External Service)  |
                           +---------------------+      +---------------------+
                                     |
                                     v
                           +---------------------+
                           |                     |
                           | Mock Flight Ops API |
                           |    (Node/Express)   |
                           |                     |
-   **React Native (Expo) Frontend:** The user-facing mobile application for Android. It communicates with the Backend Service for all data and operations.
-   **Appium Tests (Cucumber.js):** These are the automated end-to-end tests that drive the React Native application, simulating user behavior and verifying functionality. They are written in Gherkin syntax (feature files) and implemented with Cucumber.js.
-   **Backend Service (Node/Express):** The core of the application. It handles business logic, user authentication, and data storage. It acts as a single point of entry for the frontend.
-   **MongoDB Atlas (Database):** A cloud-hosted NoSQL database used to store user data, bookings, and other application-specific information.
-   **Amadeus Travel API (External Service):** A third-party API that provides real-time flight information, including search results, pricing, and availability. The Backend Service acts as a proxy to this API.
-   **Mock Flight Ops API (Node/Express):** A custom-built mock service that simulates airline-specific operations that are not available in the Amadeus API, such as getting a passenger list for a specific flight or manually moving a passenger between flights.
```
