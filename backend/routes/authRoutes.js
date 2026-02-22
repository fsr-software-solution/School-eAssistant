import express from 'express';
import {
    register,
    login,
    refreshAccessToken,
    logout,
    createAdmin,
    getAllUsers,
    getUserById,
    getUserProgress,
    updateUser,
    deleteUser
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

// Admin-only routes
router.post('/create-admin', protect, adminOnly, createAdmin);

// User management routes (all require authentication)
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, getUserById);
router.get('/users/:id/progress', protect, getUserProgress);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
