import { 
    deleteUsers, 
    deleteBooks, 
    deleteUnits, 
    deleteSections, 
    deleteInteractions, 
    deleteChatSessions, 
    deleteQuizzes, 
    deleteReferences, 
    deleteResources, 
    deleteStudentProgress, 
    deletePaymentAccounts, 
    deletePaymentTransactions, 
    deletePremiumPlans,
    deleteAllUsers,
    deleteAllBooks,
    deleteAllUnits,
    deleteAllSections,
    deleteAllChatSessions,
    deleteAllInteractions,
    deleteAllResources,
    deleteAllQuizzes,
    deleteAllReferences,
    deleteAllStudentProgress,
    deleteAllPaymentAccounts,
    deleteAllPaymentTransactions,
    deleteAllPremiumPlans
} from '../utils/hard_deleter.js'

import Users from '../models/Users.js'
import Books from '../models/Books.js'
import Units from '../models/Units.js'
import Sections from '../models/Sections.js'
import Interactions from '../models/Interactions.js'
import ChatSessions from '../models/ChatSessions.js'
import Quizzes from '../models/Quizzes.js'
import References from '../models/References.js'
import Resources from '../models/Resources.js'
import StudentProgress from '../models/StudentProgress.js'
import PaymentAccount from '../models/PaymentAccount.js'
import PaymentTransaction from '../models/PaymentTransaction.js'
import PremiumPlan from '../models/PremiumPlan.js'

export const hardDeleteUser = async (req, res) => {
    const { id } = req.params
    const result = await deleteUsers({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllUsers = async (req, res) => {
    const result = await deleteAllUsers()
    res.status(200).json({data: result})
}

export const hardDeleteBook = async (req, res) => {
    const { id } = req.params
    const result = await deleteBooks({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllBooks = async (req, res) => {
    const result = await deleteAllBooks()
    res.status(200).json({data: result})
}

export const hardDeleteUnit = async (req, res) => {
    const { id } = req.params
    const result = await deleteUnits({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllUnits = async (req, res) => {
    const result = await deleteAllUnits()
    res.status(200).json({data: result})
}

export const hardDeleteSection = async (req, res) => {
    const { id } = req.params
    const result = await deleteSections({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllSections = async (req, res) => {
    const result = await deleteAllSections()
    res.status(200).json({data: result})
}

export const hardDeleteInteraction = async (req, res) => {
    const { id } = req.params
    const result = await deleteInteractions({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllInteractions = async (req, res) => {
    const result = await deleteAllInteractions()
    res.status(200).json({data: result})
}

export const hardDeleteChatSession = async (req, res) => {
    const { id } = req.params
    const result = await deleteChatSessions({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllChatSessions = async (req, res) => {
    const result = await deleteAllChatSessions()
    res.status(200).json({data: result})
}

export const hardDeleteQuiz = async (req, res) => {
    const { id } = req.params
    const result = await deleteQuizzes({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllQuizzes = async (req, res) => {
    const result = await deleteAllQuizzes()
    res.status(200).json({data: result})
}

export const hardDeleteReference = async (req, res) => {
    const { id } = req.params
    const result = await deleteReferences({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllReferences = async (req, res) => {
    const result = await deleteAllReferences()
    res.status(200).json({data: result})
}

export const hardDeleteResource = async (req, res) => {
    const { id } = req.params
    const result = await deleteResources({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllResources = async (req, res) => {
    const result = await deleteAllResources()
    res.status(200).json({data: result})
}

export const hardDeleteStudentProgress = async (req, res) => {
    const { id } = req.params
    const result = await deleteStudentProgress({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllStudentProgress = async (req, res) => {
    const result = await deleteAllStudentProgress()
    res.status(200).json({data: result})
}

export const hardDeletePaymentAccount = async (req, res) => {
    const { id } = req.params
    const result = await deletePaymentAccounts({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllPaymentAccounts = async (req, res) => {
    const result = await deleteAllPaymentAccounts()
    res.status(200).json({data: result})
}

export const hardDeletePaymentTransaction = async (req, res) => {
    const { id } = req.params
    const result = await deletePaymentTransactions({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllPaymentTransactions = async (req, res) => {
    const result = await deleteAllPaymentTransactions()
    res.status(200).json({data: result})
}

export const hardDeletePremiumPlan = async (req, res) => {
    const { id } = req.params
    const result = await deletePremiumPlans({ id })
    res.status(200).json({data: result})
}

export const hardDeleteAllPremiumPlans = async (req, res) => {
    const result = await deleteAllPremiumPlans()
    res.status(200).json({data: result})
}

// GET controller functions for fetching soft deleted documents
const getSoftDeletedDocument = async (Model, id, res, next) => {
    const document = await Model.findOne({_id: id, isDeleted: true})
    if (!document) return next(new Error(`${Model.modelName} not found`))
    res.status(200).json({data: document})
}

const getAllSoftDeletedDocuments = async (Model, res, next) => {
    const documents = await Model.find({isDeleted: true}).sort({ updatedAt: -1 })
    res.status(200).json({data: documents})
}

export const getSoftDeletedUser = async (req, res, next) => {
    await getSoftDeletedDocument(Users, req.params.id, res, next)
}

export const getAllSoftDeletedUsers = async (req, res, next) => {
    await getAllSoftDeletedDocuments(Users, res, next)
}

export const getSoftDeletedBook = async (req, res, next) => {
    await getSoftDeletedDocument(Books, req.params.id, res, next)
}

export const getAllSoftDeletedBooks = async (req, res, next) => {
    await getAllSoftDeletedDocuments(Books, res, next)
}

export const getSoftDeletedUnit = async (req, res, next) => {
    await getSoftDeletedDocument(Units, req.params.id, res, next)
}

export const getAllSoftDeletedUnits = async (req, res, next) => {
    await getAllSoftDeletedDocuments(Units, res, next)
}

export const getSoftDeletedSection = async (req, res, next) => {
    await getSoftDeletedDocument(Sections, req.params.id, res, next)
}

export const getAllSoftDeletedSections = async (req, res, next) => {
    await getAllSoftDeletedDocuments(Sections, res, next)
}

export const getSoftDeletedInteraction = async (req, res, next) => {
    await getSoftDeletedDocument(Interactions, req.params.id, res, next)
}

export const getAllSoftDeletedInteractions = async (req, res, next) => {
    await getAllSoftDeletedDocuments(Interactions, res, next)
}

export const getSoftDeletedChatSession = async (req, res, next) => {
    await getSoftDeletedDocument(ChatSessions, req.params.id, res, next)
}

export const getAllSoftDeletedChatSessions = async (req, res, next) => {
    await getAllSoftDeletedDocuments(ChatSessions, res, next)
}

export const getSoftDeletedQuiz = async (req, res, next) => {
    await getSoftDeletedDocument(Quizzes, req.params.id, res, next)
}

export const getAllSoftDeletedQuizzes = async (req, res, next) => {
    await getAllSoftDeletedDocuments(Quizzes, res, next)
}

export const getSoftDeletedReference = async (req, res, next) => {
    await getSoftDeletedDocument(References, req.params.id, res, next)
}

export const getAllSoftDeletedReferences = async (req, res, next) => {
    await getAllSoftDeletedDocuments(References, res, next)
}

export const getSoftDeletedResource = async (req, res, next) => {
    await getSoftDeletedDocument(Resources, req.params.id, res, next)
}

export const getAllSoftDeletedResources = async (req, res, next) => {
    await getAllSoftDeletedDocuments(Resources, res, next)
}

export const getSoftDeletedStudentProgress = async (req, res, next) => {
    await getSoftDeletedDocument(StudentProgress, req.params.id, res, next)
}

export const getAllSoftDeletedStudentProgress = async (req, res, next) => {
    await getAllSoftDeletedDocuments(StudentProgress, res, next)
}

export const getSoftDeletedPaymentAccount = async (req, res, next) => {
    await getSoftDeletedDocument(PaymentAccount, req.params.id, res, next)
}

export const getAllSoftDeletedPaymentAccounts = async (req, res, next) => {
    await getAllSoftDeletedDocuments(PaymentAccount, res, next)
}

export const getSoftDeletedPaymentTransaction = async (req, res, next) => {
    await getSoftDeletedDocument(PaymentTransaction, req.params.id, res, next)
}

export const getAllSoftDeletedPaymentTransactions = async (req, res, next) => {
    await getAllSoftDeletedDocuments(PaymentTransaction, res, next)
}

export const getSoftDeletedPremiumPlan = async (req, res, next) => {
    await getSoftDeletedDocument(PremiumPlan, req.params.id, res, next)
}

export const getAllSoftDeletedPremiumPlans = async (req, res, next) => {
    await getAllSoftDeletedDocuments(PremiumPlan, res, next)
}


// PUT controller functions for restoring soft deleted documents
const restoreSingleDocument = async (Model, id, res, next) => {
    const document = await Model.findOne({_id: id, isDeleted: true})
    
    if (!document) return next(new Error(`${Model.modelName} not found`))
    document.isDeleted = false
    document.deletedAt = undefined
    await document.save()

    res.status(200).json({data: true})
}

const restoreAllDocuments = async (Model, res, next) => {
    await Model.updateMany(
        { isDeleted: true },
        { 
            $set: { 
                isDeleted: false, 
                deletedAt: undefined 
            } 
        }
    )

    res.status(200).json({data: true})
}

export const restoreUser = async (req, res, next) => {
    await restoreSingleDocument(Users, req.params.id, res, next)
}

export const restoreAllUsers = async (req, res, next) => {
    await restoreAllDocuments(Users, res, next)
}

export const restoreBook = async (req, res, next) => {
    await restoreSingleDocument(Books, req.params.id, res, next)
}

export const restoreAllBooks = async (req, res, next) => {
    await restoreAllDocuments(Books, res, next)
}

export const restoreUnit = async (req, res, next) => {
    await restoreSingleDocument(Units, req.params.id, res, next)
}

export const restoreAllUnits = async (req, res, next) => {
    await restoreAllDocuments(Units, res, next)
}

export const restoreSection = async (req, res, next) => {
    await restoreSingleDocument(Sections, req.params.id, res, next)
}

export const restoreAllSections = async (req, res, next) => {
    await restoreAllDocuments(Sections, res, next)
}

export const restoreInteraction = async (req, res, next) => {
    await restoreSingleDocument(Interactions, req.params.id, res, next)
}

export const restoreAllInteractions = async (req, res, next) => {
    await restoreAllDocuments(Interactions, res, next)
}

export const restoreChatSession = async (req, res, next) => {
    await restoreSingleDocument(ChatSessions, req.params.id, res, next)
}

export const restoreAllChatSessions = async (req, res, next) => {
    await restoreAllDocuments(ChatSessions, res, next)
}

export const restoreQuiz = async (req, res, next) => {
    await restoreSingleDocument(Quizzes, req.params.id, res, next)
}

export const restoreAllQuizzes = async (req, res, next) => {
    await restoreAllDocuments(Quizzes, res, next)
}

export const restoreReference = async (req, res, next) => {
    await restoreSingleDocument(References, req.params.id, res, next)
}

export const restoreAllReferences = async (req, res, next) => {
    await restoreAllDocuments(References, res, next)
}

export const restoreResource = async (req, res, next) => {
    await restoreSingleDocument(Resources, req.params.id, res, next)
}

export const restoreAllResources = async (req, res, next) => {
    await restoreAllDocuments(Resources, res, next)
}

export const restoreStudentProgress = async (req, res, next) => {
    await restoreSingleDocument(StudentProgress, req.params.id, res, next)
}

export const restoreAllStudentProgress = async (req, res, next) => {
    await restoreAllDocuments(StudentProgress, res, next)
}

export const restorePaymentAccount = async (req, res, next) => {
    await restoreSingleDocument(PaymentAccount, req.params.id, res, next)
}

export const restoreAllPaymentAccounts = async (req, res, next) => {
    await restoreAllDocuments(PaymentAccount, res, next)
}

export const restorePaymentTransaction = async (req, res, next) => {
    await restoreSingleDocument(PaymentTransaction, req.params.id, res, next)
}

export const restoreAllPaymentTransactions = async (req, res, next) => {
    await restoreAllDocuments(PaymentTransaction, res, next)
}

export const restorePremiumPlan = async (req, res, next) => {
    await restoreSingleDocument(PremiumPlan, req.params.id, res, next)
}

export const restoreAllPremiumPlans = async (req, res, next) => {
    await restoreAllDocuments(PremiumPlan, res, next)
}