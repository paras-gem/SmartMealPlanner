const express = require('express');
const router = express.Router();
const { Grocery } = require('../models');

// GET /api/grocery/:uid
router.get('/:uid', async (req, res) => {
    try {
        const list = await Grocery.findOne({
            $or: [
                { firebaseUID: req.params.uid },
                { userId: req.params.uid }
            ]
        }) || { items: [] };
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { firebaseUID, userId, items } = req.body;
        const uid = firebaseUID || userId;
        let list = await Grocery.findOne({
            $or: [{ firebaseUID: uid }, { userId: uid }]
        });
        if (!list) {
            list = new Grocery({ firebaseUID: uid, userId: uid, items });
        } else {
            list.items = items;
            list.firebaseUID = uid; // Ensure consistency
        }
        await list.save();
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
