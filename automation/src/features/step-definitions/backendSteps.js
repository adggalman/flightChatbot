const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const apiHelpers = require('../../helpers/apiHelpers');
const assert = require('assert');

// General steps
Given(
  /^the backend is running$/,
  async function () {
    this.response = await apiHelpers.getHealth();
  }
);

Then(
  'the response body should contain {string}',
  async function (text) {
    assert.ok(JSON.stringify(this.response.data).includes(text));
  }
);

Then('the response status should be {int}',
  async function (statusCode) {
    assert.equal(this.response.status, statusCode);
  }
);

// Steps for chat
Given(
  'I send a chat message {string}',
  async function (message) {
    try {
      this.response = await apiHelpers.sendChat(message);
    }
    catch (e) {
      this.response = e.response;
    }
  }
);

Given(
  'I send {int} chat messages with {string}',
  { timeout: 60000 },
  async function (count, message) {
    for (let i = 0; i < count; i++) {
      try {
        this.response = await apiHelpers.sendChat(message);
      }
      catch (e) {
        this.response = e.response;
      }
    }
  }
);
