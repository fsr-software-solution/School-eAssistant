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
import { deleteEmbeddedBook } from './ai_services/embeddings.js'


export const deleteUsers = async ({id}) => {
    if (id) {
        let user = await Users.findOne({_id: id, isDeleted: true})
        if (user) throw new Error('User not found')

        await deleteChatSessions({userId: user._id})
        await deleteInteractions({userId: user._id})
        await deleteStudentProgress({userId: user._id})
        await deletePaymentTransactions({userId: user._id})
        await user.deleteOne()
        return true
    }
    return false
}

export const deleteBooks = async ({id}) => {
    if (id) {
        let book = await Books.findOne({_id: id, isDeleted: true})
        if (book) throw new Error('Book not found')

        await deleteUnits({bookId: book._id})
        await deleteReferences({bookId: book._id})
        await deleteEmbeddedBook(book._id)
        await book.deleteOne()
        return true
    }
    return false
}

export const deleteUnits = async ({id, bookId}) => {
    if (id) {
        let unit = await Units.findOne({_id: id, isDeleted: true})
        if (unit) throw new Error('Unit not found')

        await deleteSections({unitId: unit._id})
        await unit.deleteOne()
        return true
    }

    if (bookId) {
        let units = await Units.find({bookId, isDeleted: true}) ?? []
        units.map( async (unit) => {
            if (unit) throw new Error('Unit not found')

            await deleteSections({unitId: unit._id})
            await unit.deleteOne()
            return true
        })
    }
    return false
}

export const deleteSections = async ({id, unitId, parentSectionId}) => {
    if (id) {
        let section = await Sections.findOne({_id: id, isDeleted: true})
        if (!section) throw new Error('Section not found')

        await deleteResources({sectionId: section._id})
        await deleteInteractions({sectionId: section._id})
        await deleteStudentProgress({sectionId: section._id})
        await section.deleteOne()
        return true
    }

    if (unitId) {
        let sections = await Sections.find({unitId, isDeleted: true}) ?? []
        for (let section of sections) {
            await deleteResources({sectionId: section._id})
            await deleteInteractions({sectionId: section._id})
            await deleteStudentProgress({sectionId: section._id})
            await section.deleteOne()
        }
        return true
    }

    if (parentSectionId) {
        let sections = await Sections.find({parentSectionId, isDeleted: true}) ?? []
        for (let section of sections) {
            await deleteResources({sectionId: section._id})
            await deleteInteractions({sectionId: section._id})
            await deleteStudentProgress({sectionId: section._id})
            await section.deleteOne()
        }
        return true
    }
    return false
}

export const deleteChatSessions = async ({id, studentId}) => {
    if (id) {
        let chatSession = await ChatSessions.findOne({_id: id, isDeleted: true})
        if (!chatSession) throw new Error('Chat session not found')

        await deleteInteractions({chatSessionId: chatSession._id})
        await deleteQuizzes({chatSessionId: chatSession._id})
        await chatSession.deleteOne()
        return true
    }

    if (studentId) {
        let chatSessions = await ChatSessions.find({studentId, isDeleted: true}) ?? []
        for (let chatSession of chatSessions) {
            await deleteInteractions({chatSessionId: chatSession._id})
            await deleteQuizzes({chatSessionId: chatSession._id})
            await chatSession.deleteOne()
        }
        return true
    }
    return false
}

export const deleteInteractions = async ({id, sectionId, chatSessionId, studentId}) => {
    if (id) {
        let interaction = await Interactions.findOne({_id: id, isDeleted: true})
        if (!interaction) throw new Error('Interaction not found')

        await deleteResources({interactionId: interaction._id})
        await deleteReferences({interactionId: interaction._id})
        await interaction.deleteOne()
        return true
    }

    if (sectionId) {
        let interactions = await Interactions.find({sectionId, isDeleted: true}) ?? []
        for (let interaction of interactions) {
            await deleteResources({interactionId: interaction._id})
            await deleteReferences({interactionId: interaction._id})
            await interaction.deleteOne()
        }
        return true
    }

    if (chatSessionId) {
        let interactions = await Interactions.find({chatSessionId, isDeleted: true}) ?? []
        for (let interaction of interactions) {
            await deleteResources({interactionId: interaction._id})
            await deleteReferences({interactionId: interaction._id})
            await interaction.deleteOne()
        }
        return true
    }

    if (studentId) {
        let interactions = await Interactions.find({studentId, isDeleted: true}) ?? []
        for (let interaction of interactions) {
            await deleteResources({interactionId: interaction._id})
            await deleteReferences({interactionId: interaction._id})
            await interaction.deleteOne()
        }
        return true
    }
    return false
}

export const deleteResources = async ({id, sectionId, interactionId}) => {
    if (id) {
        let resource = await Resources.findOne({_id: id, isDeleted: true})
        if (!resource) throw new Error('Resource not found')

        await resource.deleteOne()
        return true
    }

    if (sectionId) {
        let resources = await Resources.find({sectionId, isDeleted: true}) ?? []
        for (let resource of resources) {
            await resource.deleteOne()
        }
        return true
    }

    if (interactionId) {
        let resources = await Resources.find({interactionId, isDeleted: true}) ?? []
        for (let resource of resources) {
            await resource.deleteOne()
        }
        return true
    }
    return false
}

export const deleteQuizzes = async ({id, chatSessionId}) => {
    if (id) {
        let quiz = await Quizzes.findOne({_id: id, isDeleted: true})
        if (!quiz) throw new Error('Quiz not found')

        await deleteReferences({quizId: quiz._id})
        await quiz.deleteOne()
        return true
    }

    if (chatSessionId) {
        let quizzes = await Quizzes.find({chatSessionId, isDeleted: true}) ?? []
        for (let quiz of quizzes) {
            await deleteReferences({quizId: quiz._id})
            await quiz.deleteOne()
        }
        return true
    }
    return false
}

export const deleteReferences = async ({id, interactionId, quizId, bookId}) => {
    if (id) {
        let reference = await References.findOne({_id: id, isDeleted: true})
        if (!reference) throw new Error('Reference not found')

        await reference.deleteOne()
        return true
    }

    if (interactionId) {
        let references = await References.find({interactionId, isDeleted: true}) ?? []
        for (let reference of references) {
            await reference.deleteOne()
        }
        return true
    }

    if (quizId) {
        let references = await References.find({quizId, isDeleted: true}) ?? []
        for (let reference of references) {
            await reference.deleteOne()
        }
        return true
    }

    if (bookId) {
        let references = await References.find({bookId, isDeleted: true}) ?? []
        for (let reference of references) {
            await reference.deleteOne()
        }
        return true
    }
    return false
}

export const deleteStudentProgress = async ({id, studentId, sectionId}) => {
    if (id) {
        let progress = await StudentProgress.findOne({_id: id, isDeleted: true})
        if (!progress) throw new Error('Student progress not found')

        await progress.deleteOne()
        return true
    }

    if (studentId) {
        let progressRecords = await StudentProgress.find({studentId, isDeleted: true}) ?? []
        for (let progress of progressRecords) {
            await progress.deleteOne()
        }
        return true
    }

    if (sectionId) {
        let progressRecords = await StudentProgress.find({sectionId, isDeleted: true}) ?? []
        for (let progress of progressRecords) {
            await progress.deleteOne()
        }
        return true
    }
    return false
}

export const deletePaymentAccounts = async ({id}) => {
    if (id) {
        let account = await PaymentAccount.findOne({_id: id, isDeleted: true})
        if (!account) throw new Error('Payment account not found')

        await deletePaymentTransactions({accountId: account._id})
        await account.deleteOne()
        return true
    }
    return false
}

export const deletePaymentTransactions = async ({id, transactionId, studentId, planId}) => {
    if (id) {
        let transaction = await PaymentTransaction.findOne({_id: id, isDeleted: true})
        if (!transaction) throw new Error('Payment transaction not found')

        await transaction.deleteOne()
        return true
    }

    if (transactionId) {
        let transactions = await PaymentTransaction.find({transactionId, isDeleted: true}) ?? []
        for (let transaction of transactions) {
            await transaction.deleteOne()
        }
        return true
    }

    if (studentId) {
        let transactions = await PaymentTransaction.find({studentId, isDeleted: true}) ?? []
        for (let transaction of transactions) {
            await transaction.deleteOne()
        }
        return true
    }

    if (planId) {
        let transactions = await PaymentTransaction.find({planId, isDeleted: true}) ?? []
        for (let transaction of transactions) {
            await transaction.deleteOne()
        }
        return true
    }
    return false
}

export const deletePremiumPlans = async ({id}) => {
    if (id) {
        let plan = await PremiumPlan.findOne({_id: id, isDeleted: true})
        if (!plan) throw new Error('Premium plan not found')

        await deletePaymentTransactions({planId: plan._id})
        await plan.deleteOne()
        return true
    }
    return false
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const deleteAllUsers = async () => {
    const users = await Users.find({isDeleted: true}) ?? []
    await Promise.all(users.map(async (user) => await deleteUsers({id: user._id})))
    return true
}

export const deleteAllBooks = async () => {
    const books = await Books.find({isDeleted: true}) ?? []
    await Promise.all(books.map(async (book) => await deleteBooks({id: book._id})))
    return true
}

export const deleteAllUnits = async () => {
    const units = await Units.find({isDeleted: true}) ?? []
    await Promise.all(units.map(async (unit) => await deleteUnits({id: unit._id})))
    return true
}

export const deleteAllSections = async () => {
    const sections = await Sections.find({isDeleted: true}) ?? []
    await Promise.all(sections.map(async (section) => await deleteSections({id: section._id})))
    return true
}

export const deleteAllChatSessions = async () => {
    const chatSessions = await ChatSessions.find({isDeleted: true}) ?? []
    await Promise.all(chatSessions.map(async (chatSession) => await deleteChatSessions({id: chatSession._id})))
    return true
}

export const deleteAllInteractions = async () => {
    const interactions = await Interactions.find({isDeleted: true}) ?? []
    await Promise.all(interactions.map(async (interaction) => await deleteInteractions({id: interaction._id})))
    return true
}

export const deleteAllResources = async () => {
    const resources = await Resources.find({isDeleted: true}) ?? []
    await Promise.all(resources.map(async (resource) => await deleteResources({id: resource._id})))
    return true
}

export const deleteAllQuizzes = async () => {
    const quizzes = await Quizzes.find({isDeleted: true}) ?? []
    await Promise.all(quizzes.map(async (quiz) => await deleteQuizzes({id: quiz._id})))
    return true
}

export const deleteAllReferences = async () => {
    const references = await References.find({isDeleted: true}) ?? []
    await Promise.all(references.map(async (reference) => await deleteReferences({id: reference._id})))
    return true
}

export const deleteAllStudentProgress = async () => {
    const progressRecords = await StudentProgress.find({isDeleted: true}) ?? []
    await Promise.all(progressRecords.map(async (progress) => await deleteStudentProgress({id: progress._id})))
    return true
}

export const deleteAllPaymentAccounts = async () => {
    const accounts = await PaymentAccount.find({isDeleted: true}) ?? []
    await Promise.all(accounts.map(async (account) => await deletePaymentAccounts({id: account._id})))
    return true
}

export const deleteAllPaymentTransactions = async () => {
    const transactions = await PaymentTransaction.find({isDeleted: true}) ?? []
    await Promise.all(transactions.map(async (transaction) => await deletePaymentTransactions({id: transaction._id})))
    return true
}

export const deleteAllPremiumPlans = async () => {
    const plans = await PremiumPlan.find({isDeleted: true}) ?? []
    await Promise.all(plans.map(async (plan) => await deletePremiumPlans({id: plan._id})))
    return true
}