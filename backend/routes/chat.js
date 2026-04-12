const express = require('express');
const router = express.Router();
const { ChatSession } = require('../models');
const { nutriChatFlow } = require('../genkit/flows');

// GET prior chats
router.get('/:email', async (req, res) => {
    try {
        const session = await ChatSession.findOne({ 
            $or: [{ email: req.params.email }, { userId: req.params.email }] 
        });
        if (session) {
            res.json(session.messages);
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new chat message using Genkit
router.post('/', async (req, res) => {
    const { message, userId, firebaseUID } = req.body;
    const uid = firebaseUID || userId; 
    if (!message) return res.status(400).json({ text: "Please send a message!" });

    try {
        // Fetch existing history for context
        const session = await ChatSession.findOne({ $or: [{ email: uid }, { userId: uid }] });
        const history = (session?.messages || []).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: [{ text: m.text }]
        }));

        // Call Genkit Flow
        const reply = await nutriChatFlow({ 
            message,
            history: history.slice(-10) // Send last 10 messages for context
        });

        // Save to MongoDB
        if (uid) {
            await ChatSession.findOneAndUpdate(
                { $or: [{ email: uid }, { userId: uid }] },
                {
                    $push: {
                        messages: [
                            { role: 'user', text: message },
                            { role: 'bot', text: reply }
                        ]
                    },
                    $set: { updatedAt: new Date(), email: uid }
                },
                { upsert: true }
            );
        }

        res.json({ text: reply });
    } catch (err) {
        console.error("[Genkit Chat Error]:", err);
        res.status(500).json({ text: "I'm having a bit of trouble connecting to my brain right now. Please try again in a moment!" });
    }
});

module.exports = router;
