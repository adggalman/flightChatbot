const { GoogleGenerativeAI } = require('@google/generative-ai');
const toolExecutors = require('./toolExecutors');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a flight booking assistant. You can help users with:
  - Searching for flights (by origin, destination, date, number of passengers)
  - Booking flights
  - Retrieving a booking (PNR)
  - Cancelling a booking (PNR)
  - Looking up passenger lists for a flight (by flight number)
  - Today's date is ${new Date().toISOString().split('T')[0]}.

  You CANNOT look up bookings by e-ticket number, frequent flyer number, or passenger name.
  If a user wants to retrieve or cancel a booking, ask for their PNR (booking reference) and email address.
  Always collect both before calling retrieve_booking or cancel_booking.
  Be concise and helpful.
  You are only able to assist with flight-related requests. If a user asks about anything outside of flights, bookings, or passenger information, politely let them know you can only help with flight-related topics.
  
   IMPORTANT: You must ALWAYS use the provided tools for any booking action.
    - To create a booking: you MUST call create_booking — never invent a PNR or order ID.
    - To retrieve a booking: you MUST call retrieve_booking.
    - To cancel a booking: you MUST call cancel_booking.
    - If a tool returns an error, tell the user the action failed — do not fabricate a result.
    - After create_booking succeeds, always present the PNR (booking reference) to the user — extract it from associatedRecords[0].reference in the tool response. Never show the internal orderId to the user.
    - Never invent, guess, or assume any booking reference, PNR, flight detail, or order ID.`

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
      description: 'Get the details of a booking using the PNR (booking reference)',
      parameters: {
        type: 'OBJECT',
        properties: {
          pnr: {
            type: 'STRING', description: 'PNR (booking reference) — 6-character code from associatedRecords[0].reference'
          }
        },
        required: ['pnr']
      }
    },
    {
      name: 'cancel_booking',
      description: 'Cancel a booking using the PNR (booking reference)',
      parameters: {
        type: 'OBJECT',
        properties: {
          pnr: { type: 'STRING', description: 'PNR (booking reference) — 6-character code from associatedRecords[0].reference' }
        },
        required: ['pnr']
      },
    },
    {
      name: 'create_booking',
      description: 'Create a flight booking with selected flight offer and traveler details',
      parameters: {
        type: 'OBJECT',
        properties: {
          travelers: {
            type: 'ARRAY',
            description: 'List of travelers, each with id (string) and name (firstName, lastName)',
            items: { type: 'OBJECT' }
          },
          flightOffers: {
            type: 'ARRAY',
            description: 'The complete flight offer object(s) exactly as returned by search_flights — do not reconstruct or summarise, pass the full object unchanged',
            items: { type: 'OBJECT' }
          }
        },
        required: ['travelers', 'flightOffers']
      }
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
