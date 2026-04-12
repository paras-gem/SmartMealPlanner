const express = require('express');
const router = express.Router();
const { ChatSession } = require('../models');

// Mock scraper results for NutriBot
const MOCK_RESULTS = [
    { title: "Healthy Avocado Toast", url: "https://example.com/avocado-toast" },
    { title: "Quinoa Salad bowl", url: "https://example.com/quinoa-salad" },
    { title: "Grilled Salmon with Asparagus", url: "https://example.com/salmon-asparagus" }
];

router.post('/', async (req, res) => {
    const { query, userId, firebaseUID } = req.body;
    const uid = firebaseUID || userId;
    console.log("[Scraper API] Query received:", query, "User:", uid);

    const results = MOCK_RESULTS.filter(r =>
        r.title.toLowerCase().includes(query?.toLowerCase() || "")
    );

    const finalResults = results.length > 0 ? results : MOCK_RESULTS.slice(0, 2);

    if (uid) {
        try {
            const botMessage = `I've found some great matches for '${query}'! Check these out: ${finalResults.map(r => r.title).join(", ")}`;
            await ChatSession.findOneAndUpdate(
                { $or: [{ firebaseUID: uid }, { userId: uid }] },
                {
                    $push: {
                        messages: [
                            { role: 'user', text: `[Scrape Query] ${query}` },
                            { role: 'bot', text: botMessage }
                        ]
                    },
                    $set: { updatedAt: new Date(), firebaseUID: uid }
                },
                { upsert: true }
            );
        } catch (err) {
            console.error("[Scraper API] Failed to log session:", err);
        }
    }

    res.json({ results: finalResults });
});

module.exports = router;
