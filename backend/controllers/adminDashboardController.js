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


const adminDashboard = async (req, res, next) => {
    try {
        // Users analytics
        const users = await Users.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    students: { $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] } },
                    teachers: { $sum: { $cond: [{ $eq: ["$role", "teacher"] }, 1, 0] } },
                    admins: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } }
                }
            }
        ]);

        // Books analytics
        const books = await Books.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: ["$isActive", 1, 0] } },
                    inactive: { $sum: { $cond: ["$isActive", 0, 1] } }
                }
            }
        ]);

        // Units analytics
        const units = await Units.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: ["$isActive", 1, 0] } }
                }
            }
        ]);

        // Sections analytics
        const sections = await Sections.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: ["$isActive", 1, 0] } }
                }
            }
        ]);

        // Interactions analytics
        const interactions = await Interactions.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);

        // ChatSessions analytics
        const chatSessions = await ChatSessions.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
                }
            }
        ]);

        // Quizzes analytics
        const quizzes = await Quizzes.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: ["$isActive", 1, 0] } }
                }
            }
        ]);

        // References analytics
        const references = await References.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Resources analytics
        const resources = await Resources.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    totalDownloads: { $sum: "$downloadCount" }
                }
            }
        ]);

        // StudentProgress analytics
        const studentProgress = await StudentProgress.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    averageProgress: { $avg: "$progressPercentage" },
                    completed: { $sum: { $cond: [{ $gte: ["$progressPercentage", 100] }, 1, 0] } }
                }
            }
        ]);

        // PaymentAccounts analytics
        const paymentAccounts = await PaymentAccount.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalBalance: { $sum: "$balance" }
                }
            }
        ]);

        // PaymentTransactions analytics
        const paymentTransactions = await PaymentTransaction.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        // PremiumPlans analytics
        const premiumPlans = await PremiumPlan.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalRevenue: { $sum: "$price" }
                }
            }
        ]);

        res.status(200).json({
            users: users[0] || { total: 0, students: 0, teachers: 0, admins: 0 },
            books: books[0] || { total: 0, active: 0, inactive: 0 },
            units: units[0] || { total: 0, active: 0 },
            sections: sections[0] || { total: 0, active: 0 },
            interactions: interactions,
            chatSessions: chatSessions[0] || { total: 0, active: 0, completed: 0 },
            quizzes: quizzes[0] || { total: 0, active: 0 },
            references: references,
            resources: resources,
            studentProgress: studentProgress[0] || { total: 0, averageProgress: 0, completed: 0 },
            paymentAccounts: paymentAccounts[0] || { total: 0, totalBalance: 0 },
            paymentTransactions: paymentTransactions,
            premiumPlans: premiumPlans[0] || { total: 0, totalRevenue: 0 },
        });
    } catch (error) {
        next(error);
    }
}

export default adminDashboard