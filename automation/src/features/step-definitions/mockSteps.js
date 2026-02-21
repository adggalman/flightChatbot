const { Given, When, After } = require('@cucumber/cucumber');
const apiHelpers = require('../../helpers/apiHelpers');

After(async function () {
    if (this.createdOrderId) {
      try {
        await apiHelpers.deleteOrder(this.createdOrderId);
      } catch (_) {}
      this.createdOrderId = null;
    }
  });

Given('I create a flight order with valid data',{ timeout: 15000 }, async function () {
    try {
        const testData = {
            travelers: [{ id: '1', name: { firstName: 'TEST', lastName: 'USER' } }],
            flightOffers: [{
                id: '1',
                source: 'GDS',
                itineraries: [{
                    segments: [{ carrierCode: 'TS', number: '001' }]
                }]
            }]
        }
    this.response = await apiHelpers.createOrder(testData);
    this.createdOrderId = this.response.data.data.id;
    }
    
    catch (e) {
        this.response = e.response;
    }
});

Given('a flight order with id {string} exists', async function (orderId) {
    try {
        this.response = await apiHelpers.getOrder(orderId);
    } catch (e) {
        this.response = e.response;
    }
});

When('I retrieve the flight order {string}', async function (orderId) {
    try {
        this.response = await apiHelpers.getOrder(orderId);
    } catch (e) {
        this.response = e.response;
    }
});

When('I delete the created flight order', async function () {
    try {
        this.response = await apiHelpers.deleteOrder(this.createdOrderId);
    } catch (e) {
        this.response = e.response;
    }
});

Given('a booking exists for flight {string}', async function (flightNumber) {
    try {
        this.response = await apiHelpers.getPassengers(flightNumber);
    } catch (e) {
        this.response = e.response;
    }
});

When('I request passengers for flight {string}', async function (flightNumber) {
    try {
        this.response = await apiHelpers.getPassengers(flightNumber);
    } catch (e) {
        this.response = e.response;
    }
});