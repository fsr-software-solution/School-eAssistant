import express from 'express';
import {
  getQuizById,
  getQuizReferences,
  createQuiz,
  deleteQuiz
} from '../controllers/quizzesController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', getQuizById);
router.get('/:id/references', getQuizReferences);
router.post('/', protect, createQuiz);
router.delete('/:id', deleteQuiz);

export default router;