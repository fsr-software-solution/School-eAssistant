import express from 'express';
import {
  getInteractionById,
  getInteractionResources,
  createInteraction,
  deleteInteraction
} from '../controllers/interactionsController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', getInteractionById);
router.get('/:id/resources', getInteractionResources);
router.post('/', protect, createInteraction);
router.delete('/:id', deleteInteraction);

export default router;