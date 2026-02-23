import express from 'express';
import { 
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
} from '../controllers/restoreController.js';

const router = express.Router();

router.get('/users/:id', restoreUser);
router.get('/users', restoreAllUsers);

router.get('/books/:id', restoreBook);
router.get('/books', restoreAllBooks);

router.get('/units/:id', restoreUnit);
router.get('/units', restoreAllUnits);

router.get('/sections/:id', restoreSection);
router.get('/sections', restoreAllSections);

router.get('/interactions/:id', restoreInteraction);
router.get('/interactions', restoreAllInteractions);

router.get('/chats/:id', restoreChatSession);
router.get('/chats', restoreAllChatSessions);

router.get('/quizzes/:id', restoreQuiz);
router.get('/quizzes', restoreAllQuizzes);

router.get('/references/:id', restoreReference);
router.get('/references', restoreAllReferences);

router.get('/resources/:id', restoreResource);
router.get('/resources', restoreAllResources);

router.get('/student-progress/:id', restoreStudentProgress);
router.get('/student-progress', restoreAllStudentProgress);

router.get('/payment-account/:id', restorePaymentAccount);
router.get('/payment-account', restoreAllPaymentAccounts);

router.get('/payment-transaction/:id', restorePaymentTransaction);
router.get('/payment-transaction', restoreAllPaymentTransactions);

router.get('/premium-plan/:id', restorePremiumPlan);
router.get('/premium-plan', restoreAllPremiumPlans);


export default router;