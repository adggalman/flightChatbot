const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const userModels = require('../models/User');

router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // --- MISSING VALIDATION SECTION ---
        const missingParams = [];
        if (!email) {
            missingParams.push('email');
        }
        if (!password) {
            missingParams.push('password');
        }
        if (!name) {
            missingParams.push('name');
        }

        if (missingParams.length > 0) {
            // If any required parameters are missing, send a 400 Bad Request response
            return res.status(400).json({
                error: `Missing required query parameters: ${missingParams.join(', ')}.`
            });
        }
        // --- END MISSING VALIDATION SECTION ---

        // DUPLICATE VALIDATION
        const existing = await userModels.findOne({ email });
        if (existing) {

            return res.status(409).json({
                error: `Email already exists.`
            });
        }

        const user = await userModels.create({ email, password, name, role })
        const token = jsonwebtoken.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(201).json({
            token, user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- MISSING VALIDATION SECTION ---
        const missingParams = [];
        if (!email) {
            missingParams.push('email');
        }
        if (!password) {
            missingParams.push('password');
        }

        if (missingParams.length > 0) {
            // If any required parameters are missing, send a 400 Bad Request response
            return res.status(400).json({
                error: `Missing required query parameters: ${missingParams.join(', ')}.`
            });
        }
        // --- END MISSING VALIDATION SECTION ---

        const user = await userModels.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jsonwebtoken.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(200).json({
            token, user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });

    }
});
module.exports = router;