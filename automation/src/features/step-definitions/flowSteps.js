const { Given, When, Then } = require('@cucumber/cucumber');
const apiHelpers = require('../../helpers/apiHelpers');
const assert = require('assert');

Given('I search for flights from {string} to {string}', { timeout: 30000 }, async function (origin,
destination) {
  try {
    this.response = await apiHelpers.searchFlights({
      origin: origin,
      destination: destination,
      departureDate: '2026-12-01',
      adults: 1,
      max :5,
    });
    this.flightOffers = this.response.data;
  } catch (e) {
    this.response = e.response;
  }
});

Then('the flight search should return results', function () {
  assert.ok(this.flightOffers && this.flightOffers.length > 0);
});

When('I create a flight order with the first result', { timeout: 15000 }, async function () {
  try {
    const testData = {
      travelers: [{ id: '1', name: { firstName: 'TEST', lastName: 'USER' } }],
      flightOffers: [this.flightOffers[0]],
    };
    this.response = await apiHelpers.createOrder(testData);
    this.createdOrderId = this.response.data.data.id;
  } catch (e) {
    this.response = e.response;
  }
});

Then('the order should be created with an orderId', function () {
  assert.ok(this.createdOrderId);
});

When('I retrieve the created order', async function () {
  try {
    this.response = await apiHelpers.getOrder(this.createdOrderId);
  } catch (e) {
    this.response = e.response;
  }
});

Then('the order details should be returned', function () {
  assert.ok(JSON.stringify(this.response.data).includes('flight-order'));
});

When('I cancel the created order', async function () {
  try {
    this.response = await apiHelpers.deleteOrder(this.createdOrderId);
  } catch (e) {
    this.response = e.response;
  }
});

Then('the order should be cancelled successfully', function () {
  assert.ok(JSON.stringify(this.response.data).includes('Order cancelled'));
});

When('I retrieve the cancelled order', async function () {
  try {
    this.response = await apiHelpers.getOrder(this.createdOrderId);
  } catch (e) {
    this.response = e.response;
  }
});

Then('the response should return {int}', function (statusCode) {
  assert.equal(this.response.status, statusCode);
});