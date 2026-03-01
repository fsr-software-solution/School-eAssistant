import express from 'express';
import authRoutes from './authRoutes.js';
import usersRoutes from './usersRoutes.js';
import booksRoutes from './booksRoutes.js';
import unitsRoutes from './unitsRoutes.js';
import sectionsRoutes from './sectionsRoutes.js';
import chatRoutes from './chatRoutes.js';
import interactionsRoutes from './interactionsRoutes.js';
import quizzesRoutes from './quizzesRoutes.js';
import resourcesRoutes from './resourcesRoutes.js';
import referencesRoutes from './referencesRoutes.js';
import progressRoutes from './progressRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import hardDeleteRoutes from './hardDeleteRoutes.js'
import adminDashboard from '../controllers/adminDashboardController.js';
import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminMiddleware.js';
import translatesRoutes from './translatesRoutes.js'

const router = express.Router();

router.use('/auth', authRoutes);
router.use(protect, paymentRoutes);
router.use('/users', protect, usersRoutes);
router.use('/books', protect, booksRoutes);
router.use('/units', protect, unitsRoutes);
router.use('/sections', protect, sectionsRoutes);
router.use('/chats', protect, chatRoutes);
router.use('/interactions', protect, interactionsRoutes);
router.use('/quizzes', protect, quizzesRoutes);
router.use('/resources', protect, resourcesRoutes);
router.use('/references', protect, referencesRoutes);
router.use('/progress', protect, progressRoutes);
router.use('/translates', protect, translatesRoutes)
router.use('/admin/delete', protect, hardDeleteRoutes);
router.get('/admin/dashboard', protect, adminOnly, adminDashboard);

export default router;