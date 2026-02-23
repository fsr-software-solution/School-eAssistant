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
    getAllSoftDeletedPremiumPlans
} from '../controllers/hardDeleteController.js';

const router = express.Router();

router.get('/users/:id', getSoftDeletedUser);
router.get('/users', getAllSoftDeletedUsers);
router.delete('/users/:id', hardDeleteUser);
router.delete('/users', hardDeleteAllUsers);

router.get('/books/:id', getSoftDeletedBook);
router.get('/books', getAllSoftDeletedBooks);
router.delete('/books/:id', hardDeleteBook);
router.delete('/books', hardDeleteAllBooks);

router.get('/units/:id', getSoftDeletedUnit);
router.get('/units', getAllSoftDeletedUnits);
router.delete('/units/:id', hardDeleteUnit);
router.delete('/units', hardDeleteAllUnits);

router.get('/sections/:id', getSoftDeletedSection);
router.get('/sections', getAllSoftDeletedSections);
router.delete('/sections/:id', hardDeleteSection);
router.delete('/sections', hardDeleteAllSections);

router.get('/interactions/:id', getSoftDeletedInteraction);
router.get('/interactions', getAllSoftDeletedInteractions);
router.delete('/interactions/:id', hardDeleteInteraction);
router.delete('/interactions', hardDeleteAllInteractions);

router.get('/chats/:id', getSoftDeletedChatSession);
router.get('/chats', getAllSoftDeletedChatSessions);
router.delete('/chats/:id', hardDeleteChatSession);
router.delete('/chats', hardDeleteAllChatSessions);

router.get('/quizzes/:id', getSoftDeletedQuiz);
router.get('/quizzes', getAllSoftDeletedQuizzes);
router.delete('/quizzes/:id', hardDeleteQuiz);
router.delete('/quizzes', hardDeleteAllQuizzes);

router.get('/references/:id', getSoftDeletedReference);
router.get('/references', getAllSoftDeletedReferences);
router.delete('/references/:id', hardDeleteReference);
router.delete('/references', hardDeleteAllReferences);

router.get('/resources/:id', getSoftDeletedResource);
router.get('/resources', getAllSoftDeletedResources);
router.delete('/resources/:id', hardDeleteResource);
router.delete('/resources', hardDeleteAllResources);

router.get('/student-progress/:id', getSoftDeletedStudentProgress);
router.get('/student-progress', getAllSoftDeletedStudentProgress);
router.delete('/student-progress/:id', hardDeleteStudentProgress);
router.delete('/student-progress', hardDeleteAllStudentProgress);

router.get('/payment-account/:id', getSoftDeletedPaymentAccount);
router.get('/payment-account', getAllSoftDeletedPaymentAccounts);
router.delete('/payment-account/:id', hardDeletePaymentAccount);
router.delete('/payment-account', hardDeleteAllPaymentAccounts);

router.get('/payment-transaction/:id', getSoftDeletedPaymentTransaction);
router.get('/payment-transaction', getAllSoftDeletedPaymentTransactions);
router.delete('/payment-transaction/:id', hardDeletePaymentTransaction);
router.delete('/payment-transaction', hardDeleteAllPaymentTransactions);

router.get('/premium-plan/:id', getSoftDeletedPremiumPlan);
router.get('/premium-plan', getAllSoftDeletedPremiumPlans);
router.delete('/premium-plan/:id', hardDeletePremiumPlan);
router.delete('/premium-plan', hardDeleteAllPremiumPlans);


export default router;