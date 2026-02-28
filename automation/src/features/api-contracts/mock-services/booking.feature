@api-contracts @booking
Feature: Booking Endpoints

  Scenario: Create a flight order returns 201 with an orderId
    Given I create a flight order with valid data
    Then the response status should be 201
    And the response body should contain "flight-order"

  Scenario: Retrieve an existing flight order
    Given I create a flight order with valid data
    When I retrieve the created flight order by PNR
    Then the response status should be 200
    And the response body should contain "flight-order"

  Scenario: Retrieve a non-existent flight order returns 404
    When I retrieve the flight order by pnr "XXXXXX"
    Then the response status should be 404

  Scenario: Delete an existing flight order
    Given I create a flight order with valid data
    When I delete the created flight order
    Then the response status should be 200
    And the response body should contain "Order cancelled"
