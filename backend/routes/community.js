const express = require('express');
const router = express.Router();
const { Thread } = require('../models');

// GET /api/community
router.get('/', async (req, res) => {
    try {
        const threads = await Thread.find().sort({ createdAt: -1 });
        res.json(threads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/community
router.post('/', async (req, res) => {
    try {
        const newThread = new Thread(req.body);
        await newThread.save();
        res.status(201).json(newThread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/community/:id/reply
router.post('/:id/reply', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if(!thread) return res.status(404).json({ error: 'Not found' });
        
        thread.replies.push(req.body);
        await thread.save();
        res.json(thread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/community/:id/reply/:replyId — Edit a reply
router.put('/:id/reply/:replyId', async (req, res) => {
    try {
        const updatedThread = await Thread.findOneAndUpdate(
            { _id: req.params.id, "replies._id": req.params.replyId },
            { $set: { "replies.$.text": req.body.text } },
            { new: true }
        );

        if (!updatedThread) return res.status(404).json({ error: 'Thread or Reply not found' });
        res.json(updatedThread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/community/:id/reply/:replyId — Delete a reply
router.delete('/:id/reply/:replyId', async (req, res) => {
    try {
        const updatedThread = await Thread.findByIdAndUpdate(
            req.params.id,
            { $pull: { replies: { _id: req.params.replyId } } },
            { new: true }
        );
        
        if (!updatedThread) return res.status(404).json({ error: 'Thread not found' });
        res.json(updatedThread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/community/:id — Edit a thread
router.put('/:id', async (req, res) => {
    try {
        const { content, rating, tag } = req.body;
        const thread = await Thread.findByIdAndUpdate(
            req.params.id,
            { content, rating, tag },
            { new: true }
        );
        if(!thread) return res.status(404).json({ error: 'Not found' });
        res.json(thread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/community/:id — Delete a thread
router.delete('/:id', async (req, res) => {
    try {
        const thread = await Thread.findByIdAndDelete(req.params.id);
        if(!thread) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/community/:id/like
router.post('/:id/like', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if(!thread) return res.status(404).json({ error: 'Not found' });
        thread.likes += 1;
        await thread.save();
        res.json(thread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
