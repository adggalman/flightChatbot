@api-contracts @chat
Feature: Chat Endpoint

  Scenario: Chat returns a response for a valid message
    Given I send a chat message "hello"
    Then the chat response status should be 200
    And the response should contain a reply

  Scenario: Chat returns 400 for an empty message
    Given I send a chat message ""
    Then the chat response status should be 400

  Scenario: Chat returns 429 after exceeding rate limit
    Given I send 21 chat messages with "test"
    Then the last response status should be 429
