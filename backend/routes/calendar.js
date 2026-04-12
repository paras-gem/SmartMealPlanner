const express = require('express');
const router = express.Router();
const { User, Calendar, FamilySync } = require('../models');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// 1. Get Google Auth URL
router.get('/auth-url/:uid', async (req, res) => {
    const { uid } = req.params;
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        state: uid, // Pass uid in state to retrieve it in callback
        prompt: 'consent'
    });
    res.json({ url });
});

// 2. Auth Callback
router.get('/auth/callback', async (req, res) => {
    const { code, state: uid } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        
        // Save tokens to user
        await User.findOneAndUpdate(
            { $or: [{ firebaseUID: uid }, { email: uid }] },
            {
                $set: {
                    googleCalendarTokens: {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        expiryDate: tokens.expiry_date,
                    }
                }
            }
        );

        // Redirect back to frontend (can be a success page or main app)
        res.send('<h1>Google Calendar Connected! ✅</h1><p>You can close this window now.</p> <script>setTimeout(() => window.close(), 2000)</script>');
    } catch (err) {
        console.error("Auth Callback Error:", err);
        res.status(500).send("Authentication failed.");
    }
});

// 3. Sync Family Meal to Google Calendar
router.post('/sync-family', async (req, res) => {
    const { familyId, recipeId, recipeTitle, date, mealType } = req.body;

    try {
        const family = await FamilySync.findById(familyId);
        if (!family) return res.status(404).json({ error: "Family not found" });

        const syncResults = [];

        for (const member of family.members) {
            const user = await User.findOne({ $or: [{ firebaseUID: member.firebaseUID }, { email: member.email }] });
            if (user && user.googleCalendarTokens?.refreshToken) {
                try {
                    const client = new google.auth.OAuth2(
                        process.env.GOOGLE_CLIENT_ID,
                        process.env.GOOGLE_CLIENT_SECRET,
                        process.env.REDIRECT_URI
                    );
                    client.setCredentials({
                        refresh_token: user.googleCalendarTokens.refreshToken
                    });

                    const calendar = google.calendar({ version: 'v3', auth: client });
                    const event = {
                        summary: `🍴 Family Meal: ${recipeTitle}`,
                        description: `Meal Type: ${mealType}\nPlanned via SmartMeal Family Sync.`,
                        start: {
                            dateTime: new Date(date).toISOString(),
                            timeZone: 'UTC',
                        },
                        end: {
                            dateTime: new Date(new Date(date).getTime() + 3600000).toISOString(), // 1 hour duration
                            timeZone: 'UTC',
                        },
                    };

                    await calendar.events.insert({
                        calendarId: 'primary',
                        resource: event,
                    });
                    syncResults.push({ email: member.email, status: 'Synced' });
                } catch (err) {
                    console.error(`Failed to sync for ${member.email}:`, err.message);
                    syncResults.push({ email: member.email, status: 'Failed', error: err.message });
                }
            } else {
                syncResults.push({ email: member.email, status: 'No Tokens' });
            }
        }

        res.json({ success: true, results: syncResults });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Sync Individual Meal to Google Calendar
router.post('/sync-individual', async (req, res) => {
    const { userId, recipeId, recipeTitle, date, mealType } = req.body;

    try {
        const user = await User.findOne({ $or: [{ firebaseUID: userId }, { email: userId }] });
        if (!user || !user.googleCalendarTokens?.refreshToken) {
            return res.status(400).json({ error: "User not found or not connected to Google Calendar." });
        }

        const client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.REDIRECT_URI
        );
        client.setCredentials({
            refresh_token: user.googleCalendarTokens.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: client });
        const event = {
            summary: `🍴 Meal Plan: ${recipeTitle}`,
            description: `Meal Type: ${mealType}\nPlanned via SmartMeal Planner.`,
            start: {
                dateTime: new Date(date).toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(new Date(date).getTime() + 3600000).toISOString(), // 1 hour duration
                timeZone: 'UTC',
            },
        };

        const result = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.json({ success: true, eventLink: result.data.htmlLink });
    } catch (err) {
        console.error(`Failed to sync for ${userId}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:uid', async (req, res) => {
    try {
        const events = await Calendar.find({
            $or: [{ firebaseUID: req.params.uid }, { userId: req.params.uid }]
        });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Calendar.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
