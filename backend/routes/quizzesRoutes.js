import express from 'express';
import {
  getQuizById,
  getQuizReferences,
  createQuiz,
  attemptQuiz,
  deleteQuiz
} from '../controllers/quizzesController.js';
import protect from '../middleware/authMiddleware.js';
import { requirePremiumAccess } from '../middleware/paymentMiddleware.js';

const router = express.Router();

router.get('/:id', protect, requirePremiumAccess, getQuizById);
router.get('/:id/references', protect, requirePremiumAccess, getQuizReferences);
router.post('/', protect, requirePremiumAccess, createQuiz);
router.put('/:id', protect, requirePremiumAccess, attemptQuiz);
router.delete('/:id', protect, requirePremiumAccess, deleteQuiz);

export default router;