@happy-path
Feature: Flight Booking Happy Path

  Scenario: User searches, books, retrieves and cancels a flight
    Given I search for flights from "MNL" to "CEB"
    Then the flight search should return results
    
    When I create a flight order with the first result
    Then the order should be created with a PNR
    
    When I retrieve the created order
    Then the order details should be returned
    
    When I cancel the created order
    Then the order should be cancelled successfully
    
    When I retrieve the cancelled order
    Then the response should return 404
