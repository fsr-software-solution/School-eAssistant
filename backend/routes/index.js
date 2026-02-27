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

router.use(paymentRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/books', booksRoutes);
router.use('/units', unitsRoutes);
router.use('/sections', sectionsRoutes);
router.use('/chats', chatRoutes);
router.use('/interactions', interactionsRoutes);
router.use('/quizzes', quizzesRoutes);
router.use('/resources', resourcesRoutes);
router.use('/references', referencesRoutes);
router.use('/progress', progressRoutes);
router.use('/translates', translatesRoutes)
router.use('/admin/delete', hardDeleteRoutes);
router.get('/admin/dashboard', protect, adminOnly, adminDashboard);

export default router;