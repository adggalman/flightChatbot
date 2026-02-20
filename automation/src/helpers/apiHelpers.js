require('dotenv').config();
const axios = require('axios');
const apiSpec = require('../const/apiSpec');

const backendClient = axios.create({
    baseURL: process.env.BACKEND_URL,
});

const mockClient = axios.create({
    baseURL: process.env.MOCK_SERVICE_URL,
    headers: { 'x-service-key': process.env.SERVICE_API_KEY },
});

// Backend
const getHealth = () => backendClient.get(apiSpec.health);
const searchFlights = (params) => backendClient.get(apiSpec.flightSearch, { params });
const sendChat = (message, history = []) => backendClient.post(apiSpec.chat, { message, history });

// Mock services
const createOrder = (data) => mockClient.post(apiSpec.flightOrders, { data });
const getOrder = (orderId) => mockClient.get(`${apiSpec.flightOrders}/${orderId}`);
const deleteOrder = (orderId) => mockClient.delete(`${apiSpec.flightOrders}/${orderId}`);
const getPassengers = (flightNumber) => mockClient.get(`${apiSpec.passengers}/${flightNumber}/passengers`);

module.exports = { getHealth, searchFlights, sendChat, createOrder, getOrder, deleteOrder, getPassengers };