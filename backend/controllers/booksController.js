import Books from '../models/Books.js';
import bookContentExtractor from '../utils/ai_services/book_content_extractor.js';

/**
 * Get all books
 */
export const getAllBooks = async (req, res) => {
  try {
    const books = await Books.findActive();
    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
};

/**
 * Get a book by ID
 */
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Books.findOne({ _id: id, isDeleted: false });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
};

/**
 * Get units for a specific book
 */
export const getBookUnits = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Books.findOne({ _id: id, isDeleted: false });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const Units = await import('../models/Units.js');
    const units = await Units.default.findByBook(id);
    
    res.status(200).json({
      success: true,
      data: units
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book units',
      error: error.message
    });
  }
};

/**
 * Create a new book
 */
export const createBook = async (req, res) => {
  const bookFile = req.file;
  if (!bookFile) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const {gradeLevel, subject, version, tocStartingPage, tocEndingPage} = req.body

  await bookContentExtractor(bookFile.buffer, {
    gradeLevel,
    subject,
    version,
    tocStartingPage,
    tocEndingPage,
    filePath: bookFile.originalname
  })

  delete bookFile.buffer
  console.log(bookFile)

  res.status(201).json({
    success: true,
    message: 'Book processed successfully',
    data: {
      bookFile: bookFile.originalname
    }
  })
}

/**
 * Delete all books (bulk delete)
 */
export const deleteAllBooks = async (req, res) => {
  try {
    const result = await Books.updateMany(
      { isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    res.status(200).json({
      success: true,
      message: `Deleted ${result.modifiedCount} books`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting books',
      error: error.message
    });
  }
};