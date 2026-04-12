const express = require('express');
const router = express.Router();
const { Analytics } = require('../models');

// POST /api/analytics - Track user action
router.post('/', async (req, res) => {
    try {
        const { userId, firebaseUID, actionType, engagementScore, metadata } = req.body;
        const uid = firebaseUID || userId;
        const event = new Analytics({
            firebaseUID: uid,
            actionType,
            engagementScore,
            metadata
        });
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/analytics/:uid - Get user engagement
router.get('/:uid', async (req, res) => {
    try {
        const stats = await Analytics.find({
            $or: [{ firebaseUID: req.params.uid }, { userId: req.params.uid }]
        }).sort({ timestamp: -1 });
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
