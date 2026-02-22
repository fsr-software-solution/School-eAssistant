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
router.get('/users/all', restoreAllUsers);

router.get('/books/:id', restoreBook);
router.get('/books/all', restoreAllBooks);

router.get('/units/:id', restoreUnit);
router.get('/units/all', restoreAllUnits);

router.get('/sections/:id', restoreSection);
router.get('/sections/all', restoreAllSections);

router.get('/interactions/:id', restoreInteraction);
router.get('/interactions/all', restoreAllInteractions);

router.get('/chats/:id', restoreChatSession);
router.get('/chats/all', restoreAllChatSessions);

router.get('/quizzes/:id', restoreQuiz);
router.get('/quizzes/all', restoreAllQuizzes);

router.get('/references/:id', restoreReference);
router.get('/references/all', restoreAllReferences);

router.get('/resources/:id', restoreResource);
router.get('/resources/all', restoreAllResources);

router.get('/student-progress/:id', restoreStudentProgress);
router.get('/student-progress/all', restoreAllStudentProgress);

router.get('/payment-account/:id', restorePaymentAccount);
router.get('/payment-account/all', restoreAllPaymentAccounts);

router.get('/payment-transaction/:id', restorePaymentTransaction);
router.get('/payment-transaction/all', restoreAllPaymentTransactions);

router.get('/premium-plan/:id', restorePremiumPlan);
router.get('/premium-plan/all', restoreAllPremiumPlans);


export default router;