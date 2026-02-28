# CI/Test Logging Audit

## Goal
To identify logging gaps in the test automation suite and CI pipeline. The objective is to ensure that when a CI run fails, a developer can diagnose the root cause directly from the GitHub Actions log without downloading artifacts or re-running the tests locally.

---

## 1. Global API Logging in `apiHelpers.js`

*   **Location:** `automation/src/helpers/apiHelpers.js`
*   **Gap:** The `axios` clients (`backendClient`, `mockClient`) lack interceptors to log details of failed API requests. When a request fails, the error is caught silently in a step definition, and the log only shows a subsequent assertion failure, not the reason for the API failure itself.
*   **Suggestion:** Add an `axios` error interceptor to both clients. This interceptor should trigger only on failed requests (e.g., status 4xx or 5xx) and log the following critical information:
    *   Request Method (e.g., `POST`)
    *   Request URL
    *   Request Body (if present)
    *   Response Status (e.g., `500`)
    *   Response Body (the actual error message from the server)

## 2. Secondary Logging for Non-HTTP Errors in `catch` Blocks

*   **Location:** All `*.js` files in `automation/src/features/step-definitions/`
*   **Gap:** If an error occurs that is *not* an HTTP error (e.g., a network timeout), it would not be caught by the `axios` interceptor proposed in point #1. The current `try...catch` blocks would still swallow these errors silently.
*   **Suggestion:** As a secondary, defense-in-depth measure, the `catch` blocks should be updated to log any non-HTTP errors. This ensures that edge cases like network failures are still captured in the logs, providing a fallback for errors that the primary interceptor doesn't handle.

## 3. Insufficient Logging in `hooks.js`

*   **Location:** `automation/src/support/hooks.js`
*   **Gap:** The `After` hook logs that a scenario has `FAILED` but does not include the specific error message that caused the failure. A developer has to scroll up through the logs to find the error.
*   **Suggestion:** Modify the `After` hook. When a scenario's status is `FAILED`, the hook should also log `scenario.result.message`. This will place the exact error message (e.g., "AssertionError: expected 'Open' to equal 'Closed'") right next to the failure status in the log, making diagnosis much faster.

## 4. Silent Cleanup Failure in `mockSteps.js`

*   **Location:** `automation/src/features/step-definitions/mockSteps.js`
*   **Gap:** The `After` hook responsible for deleting the flight order created during a test uses a completely silent `catch (_) {}`. If the cleanup `deleteOrder` API call fails, it goes unnoticed. This can leave orphaned data in the test environment, potentially causing future tests to fail for unrelated reasons.
*   **Suggestion:** Update the `catch` block to issue a warning. Instead of being silent, it should use `console.warn` to log a message like `WARNING: Failed to clean up PNR: ${this.createdPnr}`. This surfaces the issue without failing the test itself, alerting developers to potential problems in the test environment.
