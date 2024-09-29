import express from 'express';
import threadManager from '../threadManager.js';
const chatRoutes = express.Router();

chatRoutes.get('/new', async (req, res) => {
    try {
        const newThread = await threadManager.createThread();
        res.status(201).json({ message: 'Thread created successfully', threadId: newThread.id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create thread', error: error.message });
    }
});


export default chatRoutes;

