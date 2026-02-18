// Import express
const express = require('express');

// Import bookings data
const MockFlightOrder = require('../models/mockFlightOrders')

// Create router
const router = express.Router();

// For GET /:flightNumber/passengers
router.get('/:flightnumber/passengers', async (req, res) => {
    try{
        const { flightnumber } = req.params;
        const passengers = [];

        // Loop to check segments
        const docs = await MockFlightOrder.find({})

            for (const doc of docs) {
                for (const offer of doc.orderData.flightOffers){
                    for (const itinerary of offer.itineraries) {
                        for (const segment of itinerary.segments) {
                            if (segment.carrierCode + segment.number === flightnumber)
                                passengers.push(...doc.orderData.travelers);
                        }
                }
            }
        }
        if (passengers.length === 0) return res.status(404).json({ error: 'No passengers found for this flight' });
        res.json({ data: passengers });
    }
    catch {
        res.status(500).json({ error: 'Server error' })
    }
});
// Export router
module.exports = router;
