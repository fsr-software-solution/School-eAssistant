import express from 'express';
import {
  getResourceById,
  deleteResourceById
} from '../controllers/resourcesController.js';

const router = express.Router();

router.get('/:id', getResourceById);
router.delete('/:id', deleteResourceById);

export default router;