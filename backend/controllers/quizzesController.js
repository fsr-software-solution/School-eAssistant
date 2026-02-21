import Quizzes from '../models/Quizzes.js'
import References from '../models/References.js'
import ChatSessions from '../models/ChatSessions.js'
import resolveQuizzes from '../utils/ai_services/resolve_quizzes.js'

export const getQuizById = async (req, res, next) => {
    const { id } = req.params
  
    const quiz = await Quizzes.findOne({ _id: id, isDeleted: false })
    if (!quiz) next(new Error('Quiz not found'))
    
    res.status(200).json({data: quiz})
}

export const getQuizReferences = async (req, res, next) => {
    const { id } = req.params
  
    const quiz = await Quizzes.findOne({ _id: id, isDeleted: false })
    if (!quiz) next(new Error('Quiz not found'))
    
    const references = await References.find({ quizId: id, isDeleted: false })    
    res.status(200).json({data: references})
}

export const createQuiz = async (req, res, next) => {
    const { chatSessionId, baseIdea, numberOfQuestions } = req.body
    const studentId = req.user._id
  
    if (!chatSessionId) next(new Error('Chat session ID is required'))
    const chatSession = await ChatSessions.findOne({_id: chatSessionId, isDeleted: false})

    if (!chatSession) next(new Error('Chat session not found'))
    if (chatSession.type !== 'quiz') next(new Error('Chat session must be a quiz session'))
    if (chatSession.studentId.toString() !== studentId.toString()) next(new Error('Access denied: You do not own this chat session'))
    
    const quizzes = await resolveQuizzes({chatSessionId, baseIdea, numberOfQuestions})
    res.status(201).json({data: quizzes})
}

export const deleteQuiz = async (req, res, next) => {
    const { id } = req.params
  
    const quiz = await Quizzes.findOne({ _id: id, isDeleted: false })
    if (!quiz) next(new Error('Quiz not found'))
    
    await quiz.softDelete()
    res.status(200).json({data: true})
}