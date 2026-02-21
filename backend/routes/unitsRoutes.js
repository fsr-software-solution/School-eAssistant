import express from 'express';
import {
  getUnitById,
  getUnitSections
} from '../controllers/unitsController.js';

const router = express.Router();

router.get('/:id', getUnitById);
router.get('/:id/sections', getUnitSections);

export default router;