const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const apiHelpers = require('../../helpers/apiHelpers');
const assert = require('assert');

Given(
  /^the backend is running$/,
  async function () {
    this.response = await apiHelpers.getHealth();
  }
);

Then('the health check should return status {int}',
  async function(statusCode){
    assert.equal(this.response.status, statusCode);
  }
);

Then(
  'the response body should contain {string}',
  async function(text){
    assert.ok(JSON.stringify(this.response.data).includes(text));
  }
);