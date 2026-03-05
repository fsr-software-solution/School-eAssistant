import express from 'express';
import upload from '../middleware/multerCloudinary.js';
import {
  getAllBooks,
  getBookById,
  getBookUnits,
  createBook,
  updateBookById,
  deleteBookById
} from '../controllers/booksController.js';

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/:id/units', getBookUnits);
router.post('/', upload.single('book'), createBook);
router.put('/:id', updateBookById);
router.delete('/:id', deleteBookById);

export default router;