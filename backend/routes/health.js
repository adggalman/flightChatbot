// Import express
const express = require('express');

// Create router
const router = express.Router();

router.get('/', (req, res) => {
    res.json({status: 'OK', timestamp: new Date().toISOString() }  );
  });

// Export router
module.exports = router;