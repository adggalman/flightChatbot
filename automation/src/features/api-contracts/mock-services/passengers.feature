@api-contracts @passengers
Feature: Passenger Endpoints

  Scenario: Get passengers for a valid flight number
    Given a booking exists for flight "AK583"
    When I request passengers for flight "AK583"
    Then the response status should be 200
    And the response body should contain "passengers"

  Scenario: Get passengers for unknown flight returns 404
    When I request passengers for flight "XX999"
    Then the response status should be 404
