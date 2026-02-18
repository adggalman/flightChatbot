const { GoogleGenerativeAI } = require('@google/generative-ai');
const toolExecutors = require('./toolExecutors');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a flight booking assistant. You can help users with:
  - Searching for flights (by origin, destination, date, number of passengers)
  - Booking flights
  - Retrieving a booking (by order ID / PNR only)
  - Cancelling a booking (by order ID / PNR)
  - Looking up passenger lists for a flight (by flight number)
  - Today's date is ${new Date().toISOString().split('T')[0]}.

  You CANNOT look up bookings by e-ticket number, frequent flyer number, or passenger name.
  Note: Flight booking creation is not yet available. You can search but cannot create new bookings yet.
  If a user wants to retrieve or manage a booking, ask for their order ID or PNR (6-character code).
  Be concise and helpful.`

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: SYSTEM_PROMPT,
  tools: [{
    functionDeclarations: [{
      name: 'search_flights',
      description: 'Search for available flights between two airports on a given date',
      parameters: {
        type: 'OBJECT',
        properties: {
          origin: { type: 'STRING', description: 'Origin airport IATA code (e.g. SYD)' },
          destination: { type: 'STRING', description: 'Destination airport IATA code (e.g. BKK)' },
          departureDate: { type: 'STRING', description: 'Departure date in YYYY-MM-DD format' },
          adults: { type: 'NUMBER', description: 'Number of adult passengers (default 1)' },
        },
        required: ['origin', 'destination', 'departureDate']
      }
    },
    {
      name: 'retrieve_booking',
      description: 'Get the details of the flight using provided orderId',
      parameters: {
        type: 'OBJECT',
        properties: {
          orderId: { type: 'STRING', description: 'orderId of the booking to be retrieved' }
        },
        required: ['orderId']
      }

    },
    {
      name: 'cancel_booking',
      description: 'Cancel booking by orderId',
      parameters: {
        type: 'OBJECT',
        properties: {
          orderId: { type: 'STRING', description: 'orderId of the booking to be retrieved' }
        },
        required: ['orderId']
      },
    },
    {
      name: 'get_passengers',
      description: 'Retrieve manifest from flight number and date',
      parameters: {
        type: 'OBJECT',
        properties: {
          flightNumber: { type: 'STRING', description: 'flightNumber to check manifest (e.g. AK583)' }
        },
        required: ['flightNumber']
      },
    },

    ]
  }]
});

async function chat(conversationHistory, role) {
  const chatSession = model.startChat({
    history: conversationHistory.slice(0, -1),
  });

  const lastMessage = conversationHistory[conversationHistory.length - 1];
  let result = await chatSession.sendMessage(lastMessage.parts[0].text);
  for (let rescounter = 0; rescounter < 5; rescounter++) {
    const response = result.response
    const part = response.candidates[0].content.parts[0]
    if (part.functionCall) {
      const functionName = part.functionCall.name;
      const args = part.functionCall.args;

      if (functionName === 'get_passengers' && role !== 'agent') {
        result = await chatSession.sendMessage([{
          functionResponse: { name: functionName, response: { error: 'I am sorry but I am unable to help you with this request.' } }
        }]);

      } else {

        const toolResult = await toolExecutors[functionName](args);
        result = await chatSession.sendMessage([{
          functionResponse: { name: functionName, response: { toolResult } }
        
        }]);
      }

    }
    else {
      break;
    }


  }
  return result.response.text();
}
module.exports = { chat };
