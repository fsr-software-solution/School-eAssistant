import express from 'express';
import {
    login,
    refreshAccessToken,
    logout,
} from '../controllers/authController.js';

const router = express.Router();

// Public auth routes
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

export default router;
