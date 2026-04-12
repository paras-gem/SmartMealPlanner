const express = require('express');
const router = express.Router();
const { Feedback } = require('../models');

// POST /api/feedback - Submit new feedback/report
router.post('/', async (req, res) => {
    try {
        const { userId, firebaseUID, name, email, subject, message } = req.body;
        const uid = firebaseUID || userId;
        const feedback = new Feedback({ firebaseUID: uid, name, email, subject, message });
        await feedback.save();
        res.status(201).json({ message: "Feedback received successfully", feedback });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/feedback - Get all feedback (for admin)
router.get('/', async (req, res) => {
    try {
        const list = await Feedback.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
