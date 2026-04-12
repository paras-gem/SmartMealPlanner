const express = require('express');
const router = express.Router();
const { AIContent } = require('../models');
const { identifyIngredientsFlow } = require('../genkit/flows');

// POST /api/ai-media/identify - Identify ingredients from vision
router.post('/identify', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'Image data is required' });

        const result = await identifyIngredientsFlow({ imageBase64 });
        res.json(result);
    } catch (err) {
        console.error("[Genkit Vision Error]:", err);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// POST /api/ai-media - Store AI generated content
router.post('/', async (req, res) => {
    try {
        const { userId, contentType, contentUrl, promptUsed, metadata } = req.body;
        const content = new AIContent({ userId, contentType, contentUrl, promptUsed, metadata });
        await content.save();
        res.status(201).json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/ai-media/:userId - Get items for a user
router.get('/:userId', async (req, res) => {
    try {
        const items = await AIContent.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
