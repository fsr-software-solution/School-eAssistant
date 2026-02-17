import express from 'express';
import {
  getUnitById,
  getUnitSections
} from '../controllers/unitsController.js';

const router = express.Router();

// GET /api/units/:id - Get a unit by ID
router.get('/:id', getUnitById);

// GET /api/units/:id/sections - Get sections for a specific unit
router.get('/:id/sections', getUnitSections);

export default router;