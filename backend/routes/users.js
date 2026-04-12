const express = require('express');
const router = express.Router();
const { User } = require('../models');

// POST /api/users/check-email — verify if email exists in MongoDB (used for forgot-password flow)
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ exists: false, message: 'Email is required' });
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ exists: false, error: err.message });
    }
});

// POST /api/users/save
router.post('/save', async (req, res) => {
    try {
        const { firebaseUID, email, name, photoURL, authProvider } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = new User({ firebaseUID, email: normalizedEmail, name, photoURL, authProvider, createdAt: new Date() });
            await user.save();
        } else if (!user.firebaseUID && firebaseUID) {
            user.firebaseUID = firebaseUID;
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users/google-auth
router.post('/google-auth', async (req, res) => {
    try {
        const { googleId, name, email, avatar } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            user = new User({
                firebaseUID: googleId,
                email: normalizedEmail,
                name,
                photoURL: avatar,
                authProvider: 'google',
                createdAt: new Date()
            });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        
        if (!user) return res.status(404).json({ message: "User not found" });
        
        // Simple password check (for practical demo)
        if (user.password && user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        
        console.log("[Users API] Login successful:", normalizedEmail);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/users/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({
            email: normalizedEmail,
            name,
            password, // Save password directly for demo
            authProvider: 'email',
            createdAt: new Date(),
            subscriptionLevel: 'Basic'
        });
        await user.save();
        console.log("[Users API] New user created:", normalizedEmail);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// POST /api/users/reset-password (Native without Firebase)
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ message: "No account found with this email" });

        // Force native password override
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password has been successfully updated natively!" });
    } catch (err) {
        res.status(500).json({ message: "Error changing password", error: err.message });
    }
});
// POST /api/users/start-trial
router.post('/start-trial', async (req, res) => {
    try {
        const { email, firebaseUID } = req.body;
        let user = await User.findOne({ $or: [{ firebaseUID }, { email }] });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Force native trial assignment
        user.trialActive = true;
        user.trialStart = new Date();
        user.subscriptionLevel = 'Basic';
        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error starting trial", error: err.message });
    }
});

// PATCH /api/users/settings
router.patch('/settings', async (req, res) => {
    try {
        const { email, themeColor, fontSize, isAIEnabled, isDarkMode } = req.body;
        const user = await User.findOneAndUpdate(
            { email },
            { themeColor, fontSize, isAIEnabled, isDarkMode },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/users/:identifier
router.patch('/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let query = {};

        // If identifier looks like an email or is 'undefined' string
        if (!identifier || identifier === 'undefined' || identifier.includes('@')) {
            const email = (req.body.email || identifier).toLowerCase().trim();
            query = { email };
        } else {
            // Assume it's a firebaseUID
            query = { firebaseUID: identifier };
        }

        const user = await User.findOneAndUpdate(
            query,
            { $set: req.body },
            { new: true, upsert: false }
        );

        if (!user) {
            console.warn("[Users API] Patch failed - User not found:", query);
            return res.status(404).json({ error: "User not found" });
        }

        console.log("[Users API] Compass updated successfully for:", user.email);
        res.json(user);
    } catch (err) {
        console.error("[Users API] Patch error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
