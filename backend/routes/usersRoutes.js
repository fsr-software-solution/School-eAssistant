import express from 'express';
import {
    getAllUsers,
    getUserById,
    getUserProgress,
    updateUser,
    deleteUser,
    createUser,
    getUserChatInteractions,
    getUserQuizzes,
    getUserPayments
} from '../controllers/authController.js';
import adminOnly from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', adminOnly, getAllUsers);
router.get('/:id', getUserById);
router.get('/:id/progress', getUserProgress);
router.get('/:id/chat-interactions', getUserChatInteractions);
router.get('/:id/quizzes', getUserQuizzes);
router.get('/:id/payments', getUserPayments);
router.post('/', adminOnly, createUser);
router.put('/:id', updateUser);
router.delete('/:id', adminOnly, deleteUser);

export default router;
