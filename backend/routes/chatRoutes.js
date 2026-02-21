import express from 'express';
import {
  getAllChats,
  getChatById,
  getChatInteractions,
  getChatQuizzes,
  createChat,
  deleteChat
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/', getAllChats);
router.get('/:id', getChatById);
router.get('/:id/interactions', getChatInteractions);
router.get('/:id/quizzes', getChatQuizzes);
router.post('/', createChat);
router.delete('/:id', deleteChat);

export default router;