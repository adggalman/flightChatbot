@api-contracts @chat
Feature: Chat Endpoint

  Scenario: Chat returns a response for a valid message
    Given I send a chat message "hello"
    Then the response status should be 200
    And the response body should contain "reply"

  Scenario: Chat returns 400 for an empty message
    Given I send a chat message ""
    Then the response status should be 400

  @local
  Scenario: Chat returns 429 after exceeding rate limit
    Given I send 21 chat messages with "test"
    Then the response status should be 429
