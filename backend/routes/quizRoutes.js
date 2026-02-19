import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import quizController from '../controllers/quizController.js';

const router = express.Router();

// Quiz Management Routes (Admin only)
router.post('/create', protect, quizController.createQuiz);
router.put('/:quizId', protect, quizController.updateQuiz);
router.delete('/:quizId', protect, quizController.deleteQuiz);

// AI-Powered Quiz Generation Routes
router.post('/generate/from-content', protect, quizController.generateQuizFromContent);
router.post('/generate/from-vector', protect, quizController.generateQuizFromVector);

// Quiz Taking Routes (Students)
router.post('/start', protect, quizController.startQuiz);
router.get('/:quizId/question/:questionIndex', protect, quizController.getQuestion);
router.post('/:quizId/question/:questionIndex/answer', protect, quizController.answerQuestion);
router.post('/:quizId/submit', protect, quizController.submitQuiz);

// Results and Analytics Routes
router.get('/results/:attemptId', protect, quizController.getQuizResults);
router.get('/progress', protect, quizController.getStudentProgress);
router.get('/analytics/:quizId', protect, quizController.getQuizAnalytics);

// Quiz Retrieval Routes
router.get('/:quizId', protect, quizController.getQuizById);
router.get('/unit/:unitId', protect, quizController.getQuizzesByUnit);
router.get('/section/:sectionId', protect, quizController.getQuizzesBySection);

export default router;