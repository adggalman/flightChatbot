const express = require('express');
const router = express.Router();
const amadeus = require('../services/amadeusClient');

// GET /api/flights/search?origin=SYD&destination=BKK&departureDate=2026-03-15&adults=1
router.get('/search', async (req, res) => {
  const { origin, destination, departureDate, adults = 1 } = req.query;

  if (!origin || !destination || !departureDate) {
    return res.status(400).json({
      error: 'Missing required params: origin, destination, departureDate',
    });
  }

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
    });
    res.json(JSON.parse(response.body));
  } catch (err) {
    res.status(err.response?.statusCode || 500).json({
      error: 'Flight search failed',
      details: err.description || err.message,
    });
  }
});

module.exports = router;
