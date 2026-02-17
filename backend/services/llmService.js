const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a flight booking assistant. You can help users with:
  - Searching for flights (by origin, destination, date, number of passengers)
  - Booking flights
  - Retrieving a booking (by order ID / PNR only)
  - Cancelling a booking (by order ID / PNR)

  You CANNOT look up bookings by e-ticket number, frequent flyer number, or passenger name.
  If a user wants to retrieve or manage a booking, ask for their order ID or PNR (6-character code).
  Be concise and helpful.`

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: SYSTEM_PROMPT,
});

async function chat(conversationHistory) {
  const chatSession = model.startChat({
    history: conversationHistory.slice(0, -1),
  });

  const lastMessage = conversationHistory[conversationHistory.length - 1];
  const result = await chatSession.sendMessage(lastMessage.parts[0].text);
  return result.response.text();
}

module.exports = { chat };
