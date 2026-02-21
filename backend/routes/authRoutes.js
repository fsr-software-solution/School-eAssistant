import express from 'express';
import {
    register,
    login,
    refreshAccessToken,
    logout,
    createAdmin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

// Admin-only routes
router.post('/create-admin', protect, createAdmin);

export default router;
