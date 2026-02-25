import Books from '../models/Books.js'
import Units from '../models/Units.js'
import bookContentExtractor from '../utils/ai_services/book_content_extractor.js'
import embedDocument from '../utils/ai_services/embeddings.js'
import { summarizer } from '../utils/ai_services/content_generator.js'


export const getAllBooks = async (req, res, next) => {
  const books = await Books.findActive()
  res.status(200).json({data: books})
}

export const getBookById = async (req, res, next) => {
  const { id } = req.params
  const book = await Books.findOne({ _id: id, isDeleted: false })

  if (!book) {
    next(new Error('Book not found'))
  }

  if (!book.summary) {
    book.summary = await summarizer({book})
    await book.save()
  }

  res.status(200).json({data: book})
}

export const getBookUnits = async (req, res, next) => {
  const { id } = req.params
  const book = await Books.findOne({ _id: id, isDeleted: false })
  
  if (!book) next(new Error('Book not found'))
  const units = await Units.findByBook(id)

  res.status(200).json({data: units})
}

export const createBook = async (req, res, next) => {
  const bookFile = req.file
  if (!bookFile) next(new Error('No file uploaded'))

  const {gradeLevel, subject, yearOfPublish, tocStartingPage, tocEndingPage} = req.body

  const book = await bookContentExtractor(bookFile.buffer, {
    gradeLevel,
    subject,
    yearOfPublish,
    tocStartingPage,
    tocEndingPage,
    filePath: bookFile.originalname
  })

  await embedDocument(bookFile.buffer, book._id)
  res.status(201).json({data: book})
}

export const updateBookById = async (req, res, next) => {
  const { id } = req.params
  const book = await Books.findOne({ _id: id, isDeleted: false })
  const {gradeLevel, subject, yearOfPublish} = req.body

  if (!book) {
    next(new Error('Book not found'))
  }

  if (gradeLevel) book.gradeLevel = gradeLevel
  if (subject) book.subject = subject
  if (yearOfPublish) book.yearOfPublish = yearOfPublish
  await book.save()

  if (!book.summary) {
    book.summary = await summarizer({book})
    await book.save()
  }

  res.status(200).json({data: book})
}

export const deleteBookById = async (req, res, next) => {
  const { id } = req.params
  const book = await Books.findOne({ _id: id, isDeleted: false })

  if (!book) next(new Error('Book not found'))
  await book.softDelete()

  res.status(200).json({data: true})
}