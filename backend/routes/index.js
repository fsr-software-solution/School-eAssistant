import express from 'express';
import booksRoutes from './booksRoutes.js';
import unitsRoutes from './unitsRoutes.js';
import sectionsRoutes from './sectionsRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

router.use('/books', booksRoutes);
router.use('/units', unitsRoutes);
router.use('/sections', sectionsRoutes);
router.use('/chats', chatRoutes);

export default router;
