import express from 'express';
import {
    getAllUsers,
    getUserById,
    getUserProgress,
    updateUser,
    deleteUser,
    createUser
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, getUserById);
router.get('/:id/progress', protect, getUserProgress);
router.post('/', protect, adminOnly, createUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
