// Import express
const express = require('express');

// Connect to MongoDB
const MockFlightOrder = require('../models/mockFlightOrders')

// Import helpers
const { generatePNR, generateOrderId } = require('../data/mockData')

// Create router
const router = express.Router();

// For POST /flight-orders
router.post('/flight-orders', async(req, res) => {
    try{
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
        // Push data to MongoDB
        await MockFlightOrder.create({ orderId: orderId, orderData: booking.data })

        // Send the mock response
        res.status(201).json(booking);
    }
    catch{
        res.status(500).json({ error: 'Server error' })
    }
});

// For GET /flight-orders?pnr=XXX
router.get('/flight-orders', async (req, res) => {
    try {
        const { pnr } = req.query;
        if (!pnr) return res.status(400).json({ error: 'pnr is required' });

        const doc = await MockFlightOrder.findOne({
            'orderData.associatedRecords': { $elemMatch: { reference: pnr } }
        });

        if (!doc) return res.status(404).json({ error: 'Order not found' });
        res.json({ data: doc.orderData });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

 // For DELETE /flight-orders?pnr=XXX
 router.delete('/flight-orders', async (req, res) => {
    try {
        const { pnr } = req.query;
        if (!pnr) return res.status(400).json({ error: 'pnr is required' });

        const doc = await MockFlightOrder.findOneAndDelete({
            'orderData.associatedRecords': { $elemMatch: { reference: pnr } }
        });

        if (!doc) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order cancelled' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});


// Export router
module.exports = router;

