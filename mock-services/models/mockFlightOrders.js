const mongoose = require('mongoose');

const mockFlightOrders = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
      },
    orderData: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      }

}, { timestamps: true });

module.exports = mongoose.model('MockFlightOrder', mockFlightOrders);