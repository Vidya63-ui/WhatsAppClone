import express from 'express';
import { postMessage, getMessages, updateMessages, deleteMessages, markMessagesAsRead } from '../controller/messageController.js';
import isAuthenticated from '../middleware/auth.js';

const router = express.Router();
router.post('/:id', isAuthenticated, postMessage);
router.get('/:id', isAuthenticated, getMessages);
router.put('/:id', isAuthenticated, updateMessages);
router.delete('/:id', isAuthenticated, deleteMessages);
router.patch('/:id/read', isAuthenticated, markMessagesAsRead);

export default router;