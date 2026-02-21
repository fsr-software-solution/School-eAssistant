import express from 'express';
import {
  getSectionById,
  getSectionSubsections,
  getSectionResources,
  getSectionInteractions,
  updateSection,
} from '../controllers/sectionsController.js';

const router = express.Router();

router.get('/:id', getSectionById);
router.get('/:id/subsections', getSectionSubsections);
router.get('/:id/resources', getSectionResources);
router.get('/:id/interactions', getSectionInteractions);
router.put('/:id', updateSection);

export default router;