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


const restoreSingleDocument = async (Model, id, res, next) => {
    const document = await Model.findOne({_id: id, isDeleted: true})
    
    if (!document) next(new Error(`${Model.modelName} not found`))
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