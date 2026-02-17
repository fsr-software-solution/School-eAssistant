import express from 'express';
import booksRoutes from './booksRoutes.js';
import unitsRoutes from './unitsRoutes.js';
import sectionsRoutes from './sectionsRoutes.js';

const router = express.Router();

// API routes
router.use('/books', booksRoutes);
router.use('/units', unitsRoutes);
router.use('/sections', sectionsRoutes);

export default router;