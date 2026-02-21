import express from 'express';
import booksRoutes from './booksRoutes.js';
import unitsRoutes from './unitsRoutes.js';
import sectionsRoutes from './sectionsRoutes.js';
import chatRoutes from './chatRoutes.js';
import interactionsRoutes from './interactionsRoutes.js';
import quizzesRoutes from './quizzesRoutes.js';
import resourcesRoutes from './resourcesRoutes.js';
import referencesRoutes from './referencesRoutes.js';
import progressRoutes from './progressRoutes.js';

const router = express.Router();

router.use('/books', booksRoutes);
router.use('/units', unitsRoutes);
router.use('/sections', sectionsRoutes);
router.use('/chats', chatRoutes);
router.use('/interactions', interactionsRoutes);
router.use('/quizzes', quizzesRoutes);
router.use('/resources', resourcesRoutes);
router.use('/references', referencesRoutes);
router.use('/progress', progressRoutes);

export default router;