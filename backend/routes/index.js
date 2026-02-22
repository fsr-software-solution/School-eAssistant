import express from 'express';
import authRoutes from './authRoutes.js';
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
import restoreRoutes from './restoreRoutes.js'
import adminDashboard from '../controllers/adminDashboardController.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/books', booksRoutes);
router.use('/units', unitsRoutes);
router.use('/sections', sectionsRoutes);
router.use('/chats', chatRoutes);
router.use('/interactions', interactionsRoutes);
router.use('/quizzes', quizzesRoutes);
router.use('/resources', resourcesRoutes);
router.use('/references', referencesRoutes);
router.use('/progress', progressRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin/hard-delete', hardDeleteRoutes);
router.use('/admin/restore', restoreRoutes);
router.get('/admin/dashboard', adminDashboard);

export default router;