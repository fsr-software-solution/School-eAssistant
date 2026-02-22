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
    hardDeleteAllPremiumPlans
} from '../controllers/hardDeleteController.js';

const router = express.Router();

router.delete('/users/:id', hardDeleteUser);
router.delete('/users/all', hardDeleteAllUsers);

router.delete('/books/:id', hardDeleteBook);
router.delete('/books/all', hardDeleteAllBooks);

router.delete('/units/:id', hardDeleteUnit);
router.delete('/units/all', hardDeleteAllUnits);

router.delete('/sections/:id', hardDeleteSection);
router.delete('/sections/all', hardDeleteAllSections);

router.delete('/interactions/:id', hardDeleteInteraction);
router.delete('/interactions/all', hardDeleteAllInteractions);

router.delete('/chats/:id', hardDeleteChatSession);
router.delete('/chats/all', hardDeleteAllChatSessions);

router.delete('/quizzes/:id', hardDeleteQuiz);
router.delete('/quizzes/all', hardDeleteAllQuizzes);

router.delete('/references/:id', hardDeleteReference);
router.delete('/references/all', hardDeleteAllReferences);

router.delete('/resources/:id', hardDeleteResource);
router.delete('/resources/all', hardDeleteAllResources);

router.delete('/student-progress/:id', hardDeleteStudentProgress);
router.delete('/student-progress/all', hardDeleteAllStudentProgress);

router.delete('/payment-account/:id', hardDeletePaymentAccount);
router.delete('/payment-account/all', hardDeleteAllPaymentAccounts);

router.delete('/payment-transaction/:id', hardDeletePaymentTransaction);
router.delete('/payment-transaction/all', hardDeleteAllPaymentTransactions);

router.delete('/premium-plan/:id', hardDeletePremiumPlan);
router.delete('/premium-plan/all', hardDeleteAllPremiumPlans);


export default router;