const express = require('express');
const router = express.Router();
const { FamilySync } = require('../models');
const { v4: uuidv4 } = require('uuid');

router.post('/create', async (req, res) => {
    try {
        const { userId, firebaseUID, name } = req.body;
        console.log("[Family API] Creating group for:", { userId, firebaseUID, name });
        const uid = firebaseUID || userId;
        const familyCode = uuidv4().slice(0, 8).toUpperCase();
        const family = new FamilySync({
            createdBy: uid,
            familyCode,
            members: [{ firebaseUID: uid, name }],
            sharedGroceryList: []
        });
        await family.save();
        console.log("[Family API] Created successfully:", familyCode);
        res.json(family);
    } catch (err) {
        console.error("[Family API] Create Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post('/join', async (req, res) => {
    try {
        const { userId, firebaseUID, name, familyCode } = req.body;
        console.log("[Family API] Joining group:", familyCode, "User:", name);
        const uid = firebaseUID || userId;
        const family = await FamilySync.findOneAndUpdate(
            { familyCode },
            { $addToSet: { members: { firebaseUID: uid, name } } },
            { new: true }
        );
        if (!family) {
            console.warn("[Family API] Join failed: Code not found", familyCode);
            return res.status(404).json({ error: 'Family code not found.' });
        }
        res.json(family);
    } catch (err) {
        console.error("[Family API] Join Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/family/:id/add-member-email — Directly add a member by email
router.post('/:id/add-member-email', async (req, res) => {
    try {
        const { email } = req.body;
        console.log("[Family API] Adding by email:", email, "to group:", req.params.id);

        const targetUser = await User.findOne({ email: email.toLowerCase() });
        if (!targetUser) {
            return res.status(404).json({ error: 'User with this email not found. They must sign up first!' });
        }

        const family = await FamilySync.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {
                    members: {
                        firebaseUID: targetUser.firebaseUID,
                        name: targetUser.name,
                        email: targetUser.email
                    }
                }
            },
            { new: true }
        );

        if (!family) return res.status(404).json({ error: 'Family group not found' });
        res.json(family);
    } catch (err) {
        console.error("[Family API] Add Member Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/family/:id
router.get('/:id', async (req, res) => {
    try {
        const family = await FamilySync.findById(req.params.id);
        if (!family) return res.status(404).json({ error: 'Family not found' });
        res.json(family);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/family/code/:code — find group by its invite code
router.get('/code/:code', async (req, res) => {
    try {
        const family = await FamilySync.findOne({ familyCode: req.params.code.toUpperCase() });
        if (!family) return res.status(404).json({ error: 'Family not found' });
        res.json(family);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/family/user/:uid — find which group a user belongs to
router.get('/user/:uid', async (req, res) => {
    try {
        const family = await FamilySync.findOne({ "members.firebaseUID": req.params.uid });
        if (!family) return res.status(404).json({ error: 'No family group found for this user.' });
        res.json(family);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/family/:id/grocery — update shared grocery list
router.patch('/:id/grocery', async (req, res) => {
    try {
        const family = await FamilySync.findByIdAndUpdate(
            req.params.id,
            { sharedGroceryList: req.body.sharedGroceryList },
            { new: true }
        );
        res.json(family);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
