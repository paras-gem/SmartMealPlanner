const express = require('express');
const router = express.Router();
const { Translate } = require('@google-cloud/translate').v2;

let translate;
if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });
} else {
    // Mock for when key is missing so server doesn't crash on boot
    translate = { translate: async (text) => [[text]] };
}

router.post('/', async (req, res) => {
    try {
        const { text, lang } = req.body;
        if (!text || !lang) return res.status(400).json({ error: "Missing text or lang" });
        const [translation] = await translate.translate(text, lang);
        res.json({ translated: translation });
    } catch (err) {
        // Fallback to original text if quota exceeded or error
        res.json({ translated: req.body.text });
    }
});

module.exports = router;
