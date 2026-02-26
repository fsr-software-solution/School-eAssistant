import express from 'express';
import { 
    hardDeleteUser,
    hardDeleteAllUsers,
    hardDeleteBook,
    hardDeleteAllBooks,
    hardDeleteUnit,
    hardDeleteAllUnits,
    hardDeleteSection,
    hardDeleteAllSections,
    hardDeleteInteraction,
    hardDeleteAllInteractions,
    hardDeleteChatSession,
    hardDeleteAllChatSessions,
    hardDeleteQuiz,
    hardDeleteAllQuizzes,
    hardDeleteReference,
    hardDeleteAllReferences,
    hardDeleteResource,
    hardDeleteAllResources,
    hardDeleteStudentProgress,
    hardDeleteAllStudentProgress,
    hardDeletePaymentAccount,
    hardDeleteAllPaymentAccounts,
    hardDeletePaymentTransaction,
    hardDeleteAllPaymentTransactions,
    hardDeletePremiumPlan,
    hardDeleteAllPremiumPlans,
    getSoftDeletedUser,
    getAllSoftDeletedUsers,
    getSoftDeletedBook,
    getAllSoftDeletedBooks,
    getSoftDeletedUnit,
    getAllSoftDeletedUnits,
    getSoftDeletedSection,
    getAllSoftDeletedSections,
    getSoftDeletedInteraction,
    getAllSoftDeletedInteractions,
    getSoftDeletedChatSession,
    getAllSoftDeletedChatSessions,
    getSoftDeletedQuiz,
    getAllSoftDeletedQuizzes,
    getSoftDeletedReference,
    getAllSoftDeletedReferences,
    getSoftDeletedResource,
    getAllSoftDeletedResources,
    getSoftDeletedStudentProgress,
    getAllSoftDeletedStudentProgress,
    getSoftDeletedPaymentAccount,
    getAllSoftDeletedPaymentAccounts,
    getSoftDeletedPaymentTransaction,
    getAllSoftDeletedPaymentTransactions,
    getSoftDeletedPremiumPlan,
    getAllSoftDeletedPremiumPlans,

    restoreUser,
    restoreAllUsers,
    restoreBook,
    restoreAllBooks,
    restoreUnit,
    restoreAllUnits,
    restoreSection,
    restoreAllSections,
    restoreInteraction,
    restoreAllInteractions,
    restoreChatSession,
    restoreAllChatSessions,
    restoreQuiz,
    restoreAllQuizzes,
    restoreReference,
    restoreAllReferences,
    restoreResource,
    restoreAllResources,
    restoreStudentProgress,
    restoreAllStudentProgress,
    restorePaymentAccount,
    restoreAllPaymentAccounts,
    restorePaymentTransaction,
    restoreAllPaymentTransactions,
    restorePremiumPlan,
    restoreAllPremiumPlans
} from '../controllers/hardDeleteController.js';

const router = express.Router();

router.get('/users/:id', getSoftDeletedUser);
router.get('/users', getAllSoftDeletedUsers);
router.put('/users/:id', restoreUser);
router.put('/users', restoreAllUsers);
router.delete('/users/:id', hardDeleteUser);
router.delete('/users', hardDeleteAllUsers);

router.get('/books/:id', getSoftDeletedBook);
router.get('/books', getAllSoftDeletedBooks);
router.put('/books/:id', restoreBook);
router.put('/books', restoreAllBooks);
router.delete('/books/:id', hardDeleteBook);
router.delete('/books', hardDeleteAllBooks);

router.get('/units/:id', getSoftDeletedUnit);
router.get('/units', getAllSoftDeletedUnits);
router.put('/units/:id', restoreUnit);
router.put('/units', restoreAllUnits);
router.delete('/units/:id', hardDeleteUnit);
router.delete('/units', hardDeleteAllUnits);

router.get('/sections/:id', getSoftDeletedSection);
router.get('/sections', getAllSoftDeletedSections);
router.put('/sections/:id', restoreSection);
router.put('/sections', restoreAllSections);
router.delete('/sections/:id', hardDeleteSection);
router.delete('/sections', hardDeleteAllSections);

router.get('/interactions/:id', getSoftDeletedInteraction);
router.get('/interactions', getAllSoftDeletedInteractions);
router.put('/interactions/:id', restoreInteraction);
router.put('/interactions', restoreAllInteractions);
router.delete('/interactions/:id', hardDeleteInteraction);
router.delete('/interactions', hardDeleteAllInteractions);

router.get('/chats/:id', getSoftDeletedChatSession);
router.get('/chats', getAllSoftDeletedChatSessions);
router.put('/chats/:id', restoreChatSession);
router.put('/chats', restoreAllChatSessions);
router.delete('/chats/:id', hardDeleteChatSession);
router.delete('/chats', hardDeleteAllChatSessions);

router.get('/quizzes/:id', getSoftDeletedQuiz);
router.get('/quizzes', getAllSoftDeletedQuizzes);
router.put('/quizzes/:id', restoreQuiz);
router.put('/quizzes', restoreAllQuizzes);
router.delete('/quizzes/:id', hardDeleteQuiz);
router.delete('/quizzes', hardDeleteAllQuizzes);

router.get('/references/:id', getSoftDeletedReference);
router.get('/references', getAllSoftDeletedReferences);
router.put('/references/:id', restoreReference);
router.put('/references', restoreAllReferences);
router.delete('/references/:id', hardDeleteReference);
router.delete('/references', hardDeleteAllReferences);

router.get('/resources/:id', getSoftDeletedResource);
router.get('/resources', getAllSoftDeletedResources);
router.put('/resources/:id', restoreResource);
router.put('/resources', restoreAllResources);
router.delete('/resources/:id', hardDeleteResource);
router.delete('/resources', hardDeleteAllResources);

router.get('/student-progress/:id', getSoftDeletedStudentProgress);
router.get('/student-progress', getAllSoftDeletedStudentProgress);
router.put('/student-progress/:id', restoreStudentProgress);
router.put('/student-progress', restoreAllStudentProgress);
router.delete('/student-progress/:id', hardDeleteStudentProgress);
router.delete('/student-progress', hardDeleteAllStudentProgress);

// router.get('/account/:id', getSoftDeletedPaymentAccount);
// router.get('/account', getAllSoftDeletedPaymentAccounts);
// router.put('/account/:id', restorePaymentAccount);
// router.put('/account', restoreAllPaymentAccounts);
// router.delete('/account/:id', hardDeletePaymentAccount);
// router.delete('/account', hardDeleteAllPaymentAccounts);

router.get('/plan/:id', getSoftDeletedPremiumPlan);
router.get('/plan', getAllSoftDeletedPremiumPlans);
router.put('/plan/:id', restorePremiumPlan);
router.put('/plan', restoreAllPremiumPlans);
router.delete('/plan/:id', hardDeletePremiumPlan);
router.delete('/plan', hardDeleteAllPremiumPlans);

// router.get('/transaction/:id', getSoftDeletedPaymentTransaction);
// router.get('/transaction', getAllSoftDeletedPaymentTransactions);
// router.put('/transaction/:id', restorePaymentTransaction);
// router.put('/transaction', restoreAllPaymentTransactions);
// router.delete('/transaction/:id', hardDeletePaymentTransaction);
// router.delete('/transaction', hardDeleteAllPaymentTransactions);

export default router;