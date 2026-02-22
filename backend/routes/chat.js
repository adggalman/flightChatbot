const express = require('express');
const { chat } = require('../services/llmService');
const passport = require('passport');

const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    req.user = user || { role: 'user' };
    next();
  })(req, res, next);
};

const router = express.Router();

// POST /api/chat
router.post('/', optionalAuth, async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Build conversation history in Gemini format
  const conversationHistory = [
    ...(history || []).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  try {
    const reply = await chat(conversationHistory, req.user.role);
    res.json({ reply });
  } catch (error) {
    console.error('LLM error:', error.message);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

module.exports = router;
