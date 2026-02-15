// Import express
const express = require('express');

// Import manifest
const { bookings } = require('../data/mockData');

// Create router
const router = express.Router();

// For GET /:flightNumber/passengers
router.get('/:flightnumber/passengers', (req, res) => {
    const { flightnumber } = req.params;
    const passengers = [];

    // Loop to check segments
    for (const booking of bookings) {
        for (const offer of booking.flightOffers) {
            for (const itinerary of offer.itineraries) {
                for (const segment of itinerary.segments) {
                    if (segment.carrierCode + segment.number === flightnumber)
                        passengers.push(...booking.travelers);
                }
            }
        }
    }
    if (passengers.length === 0) return res.status(404).json({ error: 'No passengers found for this flight' });
    res.json({ data: passengers });

});



// Export router
module.exports = router;
