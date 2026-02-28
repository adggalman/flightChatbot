const { Given, When, After } = require('@cucumber/cucumber');
const apiHelpers = require('../../helpers/apiHelpers');

After(async function () {
    if (this.createdPnr) {
      try {
        await apiHelpers.deleteOrder(this.createdPnr);
      } catch (_) {}
      this.createdPnr = null;
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
    this.createdPnr = this.response.data.data.associatedRecords[0].reference;
    }
    
    catch (e) {
        this.response = e.response;
    }
});

Given('a flight order with pnr {string} exists', async function (pnr) {
    try {
        this.response = await apiHelpers.getOrder(pnr);
    } catch (e) {
        this.response = e.response;
    }
});

When('I retrieve the flight order by pnr {string}', async function (pnr) {
    try {
        this.response = await apiHelpers.getOrder(pnr);
    } catch (e) {
        this.response = e.response;
    }
});

When('I retrieve the created flight order by PNR', async function () {
    try {
        this.response = await apiHelpers.getOrder(this.createdPnr);
    } catch (e) {
        this.response = e.response;
    }
});

When('I delete the created flight order', async function () {
    try {
        this.response = await apiHelpers.deleteOrder(this.createdPnr);
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