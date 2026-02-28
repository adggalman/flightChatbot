// Base URLs for backend (Amadeus) and mock service (booking/passengers)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const MOCK_SERVICE_URL = process.env.MOCK_SERVICE_URL || 'http://localhost:3001';

// Calls Amadeus flight search via backend
async function search_flights(args) {
    const params = new URLSearchParams({
        origin: args.origin,
        destination: args.destination,
        departureDate: args.departureDate
    });
    if (args.adults) params.set('adults', args.adults);

    const res = await fetch(`${BACKEND_URL}/api/flights/search?${params}`);
    return res.json();

};
// Retrieves booking from mock service
async function retrieve_booking(args){
    const res = await fetch(`${MOCK_SERVICE_URL}/mock-api/booking/flight-orders?pnr=${args.pnr}`, { headers:{ 'x-service-key': process.env.SERVICE_API_KEY }});
    return res.json();
}

// Cancels booking from mock service
async function cancel_booking(args){
    const res = await fetch(`${MOCK_SERVICE_URL}/mock-api/booking/flight-orders?pnr=${args.pnr}`, {method: 'DELETE', headers:{ 'x-service-key': process.env.SERVICE_API_KEY}}); 
    return res.json();
};

// Gets passenger list from mock service
async function get_passengers(args){
    const res = await fetch(`${MOCK_SERVICE_URL}/mock-api/flights/${args.flightNumber}/passengers`, { headers:{ 'x-service-key': process.env.SERVICE_API_KEY }});
    return res.json();
};

// Creates a booking in mock service
async function create_booking(args) {
    const res = await fetch(`${MOCK_SERVICE_URL}/mock-api/booking/flight-orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-service-key': process.env.SERVICE_API_KEY
        },
        body: JSON.stringify({
            data: {
                travelers: args.travelers,
                flightOffers: args.flightOffers
            }
        })
    });
    return res.json();
}

module.exports = {search_flights, retrieve_booking, cancel_booking, get_passengers, create_booking};