import express from 'express';
import {
  getAllChats,
  getChatById,
  getChatInteractions,
  getChatQuizzes,
  createChat,
  deleteChat
} from '../controllers/chatController.js';
import protect from '../middleware/authMiddleware.js';
import requirePremiumAccess from '../middleware/paymentMiddleware.js';

const router = express.Router();

router.get('/', protect, requirePremiumAccess, getAllChats);
router.get('/:id', protect, requirePremiumAccess, getChatById);
router.get('/:id/interactions', protect, requirePremiumAccess, getChatInteractions);
router.get('/:id/quizzes', protect, requirePremiumAccess, getChatQuizzes);
router.post('/', protect, requirePremiumAccess, createChat);
router.delete('/:id', protect, requirePremiumAccess, deleteChat);

export default router;