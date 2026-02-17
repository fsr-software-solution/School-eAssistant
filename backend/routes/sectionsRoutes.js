import express from 'express';
import {
  getSectionById,
  getSectionSubsections,
  getSectionResources,
  getSectionInteractions,
  updateSection,
  deleteSection
} from '../controllers/sectionsController.js';

const router = express.Router();

// GET /api/sections/:id - Get a section by ID
router.get('/:id', getSectionById);

// GET /api/sections/:id/subsections - Get subsections for a specific section
router.get('/:id/subsections', getSectionSubsections);

// GET /api/sections/:id/resources - Get resources for a specific section
router.get('/:id/resources', getSectionResources);

// GET /api/sections/:id/interactions - Get interactions for a specific section
router.get('/:id/interactions', getSectionInteractions);

// PUT /api/sections/:id - Update a section
router.put('/:id', updateSection);

// DELETE /api/sections/:id - Delete a section
router.delete('/:id', deleteSection);

export default router;