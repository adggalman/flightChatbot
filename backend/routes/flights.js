// Import express
const express = require('express');

// Create router
const router = express.Router();

// Import Amadeus
const amadeusClient = require('../services/amadeusClient');

// For GET /flight/search
router.get('/search', async (req, res) => {
    const { origin, destination, departureDate, adults = 1 } = req.query;

    // --- VALIDATION SECTION ---
    const missingParams = [];
    if (!origin) {
        missingParams.push('origin');
    }
    if (!destination) {
        missingParams.push('destination');
    }
    if (!departureDate) {
        missingParams.push('departureDate');
    }

    if (missingParams.length > 0) {
        // If any required parameters are missing, send a 400 Bad Request response
        return res.status(400).json({
            error: `Missing required query parameters: ${missingParams.join(', ')}.`,
            example: "/api/flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&adults=1"
        });
    }
    // --- END VALIDATION SECTION ---

    // AMADEUS API CALL
    try {
        const response = await amadeusClient.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: departureDate,
            adults: adults
        });
        res.status(200).json(response.data);

    } catch (error) {
        console.error('Error calling Amadeus Flight Offers Search API:', error.response ? error.response.data : error.message);

        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                error: 'Failed to fetch flight offers.',
                details: error.response.data.error || [error.response.data.detail || error.message]
            });

        } else {
            return res.status(500).json({
                error: 'Unexpected error.',
                details: error.message
            });

        }
    }
});

// Export router
module.exports = router;