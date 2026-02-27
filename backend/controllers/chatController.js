import ChatSessions from '../models/ChatSessions.js'
import Interactions from '../models/Interactions.js'
import Quizzes from '../models/Quizzes.js'
import Users from '../models/Users.js'
import { summarizer } from '../utils/ai_services/content_generator.js'


export const getAllChats = async (req, res, next) => {
  const chats = await ChatSessions.findActive()
  res.status(200).json({ data: chats })
}

export const getChatById = async (req, res, next) => {
  const { id } = req.params
  const chat = await ChatSessions.findOne({ _id: id, isDeleted: false })
  
  if (!chat) return next(new Error('Chat session not found'))

  res.status(200).json({ data: chat })
}

export const getChatInteractions = async (req, res, next) => {
  const { id } = req.params
  const chat = await ChatSessions.findOne({_id: id, isDeleted: false})
  
  if (!chat) return next(new Error('Chat session not found'))
  if (chat.type !== 'interaction') return next(new Error('This chat session is not a interaction session'))

  const interactions = await Interactions.findByChatSession(id) ?? []
  if (!chat.summary && interactions.length != 0) {
    chat.summary = await summarizer({ interaction: interactions[0] })
    await chat.save()
  }

  res.status(200).json({ data: interactions })
}

export const getChatQuizzes = async (req, res, next) => {
  const { id } = req.params
  const chat = await ChatSessions.findOne({_id: id, isDeleted: false})
  
  if (!chat || chat.isDeleted) return next(new Error('Chat session not found'))
  if (chat.type !== 'quiz') return next(new Error('This chat session is not a quiz session'))

  const quizzes = await Quizzes.findByChatSession(id) ?? []
  if (!chat.summary && quizzes.length != 0) {
    chat.summary = await summarizer({ quiz: quizzes[0] })
    await chat.save()
  }

  res.status(200).json({ data: quizzes })
}

export const createChat = async (req, res, next) => {
  const { type } = req.body
  const studentId = req.user?._id

  const student = await Users.findOne({_id: studentId, isDeleted: false})
  if (!student || student.isDeleted || student.role !== 'student') return next(new Error('Invalid student ID or student not found'))
  if (!studentId || !type) return next(new Error('StudentId and type are required'))
  if (!['interaction', 'quiz'].includes(type)) return next(new Error('Type must be either "interaction" or "quiz"'))

  const chat = await ChatSessions.create({
    studentId,
    type
  })

  res.status(201).json({ data: chat })
}

export const deleteChat = async (req, res, next) => {
  const { id } = req.params
  const chat = await ChatSessions.findOne({_id: id, isDeleted: false})
  
  if (!chat || chat.isDeleted) return next(new Error('Chat session not found'))
  await chat.softDelete()

  res.status(200).json({ data: true })
}