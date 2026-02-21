import express from 'express';
import {
  getInteractionById,
  getInteractionResources,
  createInteraction,
  deleteInteraction
} from '../controllers/interactionsController.js';

const router = express.Router();

router.get('/:id', getInteractionById);
router.get('/:id/resources', getInteractionResources);
router.post('/', createInteraction);
router.delete('/:id', deleteInteraction);

export default router;