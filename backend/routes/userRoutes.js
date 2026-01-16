import express from 'express';
import { registerUser, loginUser, logoutUser, getChatList, getUserDetails, searchUserByEmail } from '../controller/userController.js';
import isAuthenticated from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isAuthenticated, logoutUser);
router.get('/me', isAuthenticated, getUserDetails);
router.get('/chatlist', isAuthenticated, getChatList);
router.get('/search', isAuthenticated, searchUserByEmail);

export default router;