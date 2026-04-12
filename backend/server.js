require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/project_x_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB via Compass'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.use(cors());
app.use(express.json());

// Import and use all route files
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/grocery', require('./routes/grocery'));
app.use('/api/scrape', require('./routes/scraper'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/ai-media', require('./routes/aiMedia'));
app.use('/api/family', require('./routes/family'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/translate', require('./routes/translate'));
app.use('/api/community', require('./routes/community'));


app.get('/', (req, res) => {
    res.json({ status: 'SmartMeal API running ✅', version: '1.0', port: process.env.PORT || 5000 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

