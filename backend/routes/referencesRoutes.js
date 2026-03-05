import express from 'express';
import {
  getReferenceById,
  getReferenceBooks,
  deleteReferenceById
} from '../controllers/referencesController.js';

const router = express.Router();

router.get('/:id', getReferenceById);
router.get('/:id/books', getReferenceBooks);
router.delete('/:id', deleteReferenceById);

export default router;