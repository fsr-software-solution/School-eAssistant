import express from 'express';
import {
  getStudentProgress,
  createStudentProgress,
  updateStudentProgress,
  deleteStudentProgress
} from '../controllers/progressController.js';

const router = express.Router();

router.get('/:id', getStudentProgress);
router.post('/', createStudentProgress);
router.put('/:id', updateStudentProgress);
router.delete('/:id', deleteStudentProgress);

export default router;2