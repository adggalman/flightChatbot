@api-contracts @health
Feature: Health Check

  Scenario: Backend health check returns ok
    Given the backend is running
    Then the response status should be 200
    And the response body should contain "OK"
