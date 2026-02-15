// Import express
const express = require('express');

// Import data
const { bookings, generatePNR, generateOrderId } = require('../data/mockData');


// Create router
const router = express.Router();

// For POST /flight-orders
router.post('/flight-orders', (req, res) => {

    // Extract travelers and flightOffers from request
    const { travelers, flightOffers } = req.body.data;

    // Basic validation: Check if required data is present
    if (!travelers || !flightOffers) {
        return res.status(400).json({ error: 'Missing travelers or flightOffers in request body' });
    }

    // Generate PNR and orderId
    const pnr = generatePNR();
    const orderId = generateOrderId();

    const booking = {
        data: {
            type: 'flight-order',
            id: orderId,
            associatedRecords: [
                {
                    reference: pnr,
                    originSystemCode: 'GDS',
                },
            ],
            // Echo the flightOffers and travelers from the request
            flightOffers: flightOffers,
            travelers: travelers,
        },
    };
    // Push data to booking array
    bookings.push(booking.data);

    // Send the mock response
    res.status(201).json(booking);

});

// For GET /flight-orders/:id
router.get('/flight-orders/:id', (req, res) => {

    const id = req.params.id;

    // Find the booking in the in-memory array
    const booking = bookings.find(b => b.id === id);

    // Validation
    if (!booking) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: booking });

});

// For DELETE /flight-orders/:id
router.delete('/flight-orders/:id', (req, res) => {

    // Find the index of the booking to be removed
    const id = req.params.id
    const index = bookings.findIndex(b => b.id === id);

    // Delete row
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    bookings.splice(index, 1);
    res.json({ message: 'Order cancelled' });
});


// Export router
module.exports = router;

