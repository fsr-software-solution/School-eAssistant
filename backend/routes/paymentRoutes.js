import express from 'express';
import { PaymentController, upload } from '../controllers/paymentController.js';
import premiumPlanController from '../controllers/premiumPlanController.js';
import paymentAccountController from '../controllers/paymentAccountController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/account', PaymentController.getPaymentAccount);

router.get('/plans', protect, premiumPlanController.getActivePlans);
router.get('/premium-access', protect, PaymentController.checkPremiumAccess);
router.post(
  '/upload-screenshot',
  protect,
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
router.get('/history', protect, PaymentController.getPaymentHistory);
router.get('/status/:transactionId', protect, PaymentController.getPaymentStatus);
router.post('/admin/plans', protect, adminOnly, premiumPlanController.createPlan);
router.get('/admin/plans', protect, adminOnly, premiumPlanController.getAllPlans);
router.get('/admin/plans/:planId', protect, adminOnly, premiumPlanController.getPlanById);
router.put('/admin/plans/:planId', protect, adminOnly, premiumPlanController.updatePlan);
router.delete('/admin/plans/:planId', protect, adminOnly, premiumPlanController.deletePlan);
router.put('/admin/plans/:planId/restore', protect, adminOnly, premiumPlanController.restorePlan);

router.get('/admin/account', protect, adminOnly, paymentAccountController.getAccount);
router.put('/admin/account', protect, adminOnly, paymentAccountController.upsertAccount);

router.get('/admin/payments', protect, adminOnly, PaymentController.getAllPayments);
router.put('/admin/payments/:transactionId/status', protect, adminOnly, PaymentController.updatePaymentStatus);

export default router;


