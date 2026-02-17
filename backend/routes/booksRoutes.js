import express from 'express';
import upload from '../middleware/multerCloudinary.js';
import {
  getAllBooks,
  getBookById,
  getBookUnits,
  createBook,
  deleteAllBooks
} from '../controllers/booksController.js';

const router = express.Router();

// GET /api/books - Get all books
router.get('/', getAllBooks);

// GET /api/books/:id - Get a book by ID
router.get('/:id', getBookById);

// GET /api/books/:id/units - Get units for a specific book
router.get('/:id/units', getBookUnits);

// POST /api/books - Create a new book
router.post('/', upload.single('book'), createBook);

// DELETE /api/books - Delete all books (bulk delete)
router.delete('/', deleteAllBooks);

export default router;