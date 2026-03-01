import express from 'express';
import { PaymentController, upload } from '../controllers/paymentController.js';
import premiumPlanController from '../controllers/premiumPlanController.js';
import paymentAccountController from '../controllers/paymentAccountController.js';
import adminOnly from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/account', PaymentController.getPaymentAccount);

router.get('/plans', premiumPlanController.getActivePlans);
router.get('/premium-access', PaymentController.checkPremiumAccess);
router.post(
  '/upload-screenshot',
 
  (req, res, next) => {
    upload.single('screenshot')(req, res, (err) => {
      if (err) {
        // Handle multer errors (file size, format, etc.)
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error',
          error: err.message
        });
      }
      next();
    });
  },
  PaymentController.uploadPaymentScreenshot
);
router.get('/history', PaymentController.getPaymentHistory);
router.get('/status/:transactionId', PaymentController.getPaymentStatus);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/admin/plans', adminOnly, premiumPlanController.createPlan);
router.get('/admin/plans', adminOnly, premiumPlanController.getAllPlans);
router.get('/admin/plans/:planId', adminOnly, premiumPlanController.getPlanById);
router.put('/admin/plans/:planId', adminOnly, premiumPlanController.updatePlan);
router.delete('/admin/plans/:planId', adminOnly, premiumPlanController.deletePlan);
router.put('/admin/plans/:planId/restore', adminOnly, premiumPlanController.restorePlan);

router.get('/admin/account', adminOnly, paymentAccountController.getAccount);
router.put('/admin/account', adminOnly, paymentAccountController.upsertAccount);

router.get('/admin/payments', adminOnly, PaymentController.getAllPayments);
router.put('/admin/payments/:id/status', adminOnly, PaymentController.updatePaymentStatus);

export default router;