const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a flight booking assistant. You help users search for flights, make bookings, and manage their reservations. Be concise and helpful.`;

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
