import express from 'express';
import {
  getQuizById,
  getQuizReferences,
  createQuiz,
  attemptQuiz,
  deleteQuiz
} from '../controllers/quizzesController.js';
import requirePremiumAccess from '../middleware/paymentMiddleware.js';

const router = express.Router();

router.get('/:id', requirePremiumAccess, getQuizById);
router.get('/:id/references', requirePremiumAccess, getQuizReferences);
router.post('/', requirePremiumAccess, createQuiz);
router.put('/:id', requirePremiumAccess, attemptQuiz);
router.delete('/:id', requirePremiumAccess, deleteQuiz);

export default router;