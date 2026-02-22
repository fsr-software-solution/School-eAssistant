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
