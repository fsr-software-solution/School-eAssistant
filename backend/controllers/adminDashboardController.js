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
    // Run all queries in parallel for efficiency
    const [
      usersStats,
      booksStats,
      unitsCount,
      sectionsCount,
      interactionsCount,
      chatSessionsStats,
      quizzesCount,
      referencesCount,
      resourcesStats,
      studentProgressStats,
      paymentAccount,
      paymentTransactionsStats,
      premiumPlansStats,
    ] = await Promise.all([
      getUsersStats(),
      getBooksStats(),
      Units.countDocuments({ isDeleted: false }),
      Sections.countDocuments({ isDeleted: false }),
      Interactions.countDocuments({ isDeleted: false }),
      getChatSessionsStats(),
      Quizzes.countDocuments({ isDeleted: false }),
      References.countDocuments({ isDeleted: false }),
      getResourcesStats(),
      getStudentProgressStats(),
      PaymentAccount.getActiveAccount(), // returns the active account or null
      getPaymentTransactionsStats(),
      getPremiumPlansStats(),
    ]);

    res.status(200).json({
      users: usersStats,
      books: booksStats,
      units: { total: unitsCount },
      sections: { total: sectionsCount },
      interactions: { total: interactionsCount },
      chatSessions: chatSessionsStats,
      quizzes: { total: quizzesCount },
      references: { total: referencesCount },
      resources: resourcesStats,
      studentProgress: studentProgressStats,
      paymentAccounts: paymentAccount ? {
        accountNumber: paymentAccount.accountNumber,
        accountHolder: paymentAccount.accountHolderFullName,
        bankName: paymentAccount.bankName,
        isActive: paymentAccount.isActive,
      } : { message: 'No active payment account set' },
      paymentTransactions: paymentTransactionsStats,
      premiumPlans: premiumPlansStats,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- Helper functions ----------

async function getUsersStats() {
  const total = await Users.countDocuments({ isDeleted: false });
  const byRole = await Users.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);
  const roleCounts = byRole.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});
  return { total, byRole: roleCounts };
}

async function getBooksStats() {
  const total = await Books.countDocuments({ isDeleted: false });
  const byGradeLevel = await Books.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$gradeLevel', count: { $sum: 1 } } },
  ]);
  const gradeCounts = byGradeLevel.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});
  return { total, byGradeLevel: gradeCounts };
}

async function getChatSessionsStats() {
  const total = await ChatSessions.countDocuments({ isDeleted: false });
  const byType = await ChatSessions.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  const typeCounts = byType.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});
  return { total, byType: typeCounts };
}

async function getResourcesStats() {
  const total = await Resources.countDocuments({ isDeleted: false });
  const byType = await Resources.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  const typeCounts = byType.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});
  return { total, byType: typeCounts };
}

async function getStudentProgressStats() {
  const total = await StudentProgress.countDocuments({ isDeleted: false });
  const byStatus = await StudentProgress.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const statusCounts = byStatus.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});
  return { total, byStatus: statusCounts };
}

async function getPaymentTransactionsStats() {
  const total = await PaymentTransaction.countDocuments(); // no soft delete on this model
  const byStatus = await PaymentTransaction.aggregate([
    { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
  ]);
  const statusCounts = byStatus.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});
  // Include a few recent pending transactions for quick review
  const recentPending = await PaymentTransaction.find({ verificationStatus: 'pending' })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('studentId', 'username')
    .populate('planId', 'planName amount')
    .lean();
  return { total, byStatus: statusCounts, recentPending };
}

async function getPremiumPlansStats() {
  const total = await PremiumPlan.countDocuments({ isDeleted: false });
  const plans = await PremiumPlan.find({ isDeleted: false })
    .sort({ amount: 1 })
    .lean();
  return { total, plans };
}

export default adminDashboard;