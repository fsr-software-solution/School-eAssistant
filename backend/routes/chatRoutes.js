import express from 'express';
import {
  getAllChats,
  getChatById,
  getChatInteractions,
  getChatQuizzes,
  createChat,
  deleteChat
} from '../controllers/chatController.js';
import requirePremiumAccess from '../middleware/paymentMiddleware.js';

const router = express.Router();

router.get('/', requirePremiumAccess, getAllChats);
router.get('/:id', requirePremiumAccess, getChatById);
router.get('/:id/interactions', requirePremiumAccess, getChatInteractions);
router.get('/:id/quizzes', requirePremiumAccess, getChatQuizzes);
router.post('/', requirePremiumAccess, createChat);
router.delete('/:id', requirePremiumAccess, deleteChat);

export default router;