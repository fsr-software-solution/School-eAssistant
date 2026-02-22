import multer from 'multer';
import cloudinary from 'cloudinary';
import { z } from 'zod';
import PaymentTransaction from '../models/PaymentTransaction.js';
import PremiumPlan from '../models/PremiumPlan.js';
import PaymentAccount from '../models/PaymentAccount.js';
import paymentOcrService from '../services/paymentOcrService.js';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Request validation schema
const uploadPaymentSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required')
});

// Multer config for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_SCREENSHOT_SIZE_MB) || 5) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedFormats = (process.env.ALLOWED_SCREENSHOT_FORMATS || 'jpg,jpeg,png').split(',');
    const ext = file.mimetype.split('/')[1]?.toLowerCase();
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid format. Allowed: ${allowedFormats.join(', ')}`), false);
    }
  }
});

function normalizeForComparison(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/\n+/g, ' ')  // Replace newlines with spaces
    .replace(/\r+/g, ' ')   // Replace carriage returns with spaces
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .trim();
}

/**
 * Check if two names match (flexible - handles minor variations)
 */
function namesMatch(name1, name2) {
  const n1 = normalizeForComparison(name1);
  const n2 = normalizeForComparison(name2);
  if (n1 === n2) return true;
  // Check if one contains the other (for "School eAssistant" vs "School-eAssistant")
  return n1.includes(n2) || n2.includes(n1);
}

/**
 * Check if account numbers match (normalize by removing spaces/dashes)
 */
function accountNumbersMatch(acc1, acc2) {
  if (!acc1 || !acc2) return false;
  const n1 = String(acc1).replace(/[\s\-]/g, '');
  const n2 = String(acc2).replace(/[\s\-]/g, '');
  return n1 === n2;
}

class PaymentController {
  /**
   * Get payment account info (for students to see where to pay)
   */
  static async getPaymentAccount(req, res) {
    try {
      const account = await PaymentAccount.getActiveAccount();
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Payment account not configured. Please contact admin.'
        });
      }
      res.status(200).json({
        success: true,
        data: {
          accountNumber: account.accountNumber,
          accountHolderFullName: account.accountHolderFullName,
          bankName: account.bankName,
          message: 'Please pay using mobile banking and verify the recipient full name before confirming.'
        }
      });
    } catch (error) {
      console.error('Get payment account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment account',
        error: error.message
      });
    }
  }

  /**
   * Upload payment screenshot - Full OCR + validation flow
   */
  static async uploadPaymentScreenshot(req, res, next) {
    let cloudinaryResult = null;

    try {
      // Validate - studentId from auth, planId from body
      const validation = uploadPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validation.error.errors
        });
      }

      const studentId = req.user?.id;
      const { planId } = validation.data;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Payment screenshot file is required'
        });
      }

      // 1. Upload to Cloudinary
      cloudinaryResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: 'payment_screenshots',
            resource_type: 'image',
            unique_filename: true
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      // 2. OCR - Extract payment data using LangChain + Gemini + Zod
      console.log('Starting OCR extraction from:', cloudinaryResult.secure_url);
      const extractedData = await paymentOcrService.extractPaymentFromImage(
        cloudinaryResult.secure_url
      );
      console.log('OCR extracted data:', {
        transactionId: extractedData.transactionId,
        senderName: extractedData.senderName,
        recipientName: extractedData.recipientName,
        recipientAccountNumber: extractedData.recipientAccountNumber,
        amount: extractedData.amount,
        paymentDate: extractedData.paymentDate
      });

      // 3. Get plan and payment account
      const plan = await PremiumPlan.findById(planId);
      if (!plan || plan.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Premium plan not found or inactive'
        });
      }

      const paymentAccount = await PaymentAccount.getActiveAccount();
      if (!paymentAccount) {
        return res.status(503).json({
          success: false,
          message: 'Payment account not configured. Contact admin.'
        });
      }

      // 4. Validate recipient name and account
      const recipientNameMatch = namesMatch(
        extractedData.recipientName,
        paymentAccount.accountHolderFullName
      );
      
      // Account number validation - only required if extracted (some screenshots don't show full account numbers)
      const extractedAccountNumber = extractedData.recipientAccountNumber?.trim() || '';
      const hasAccountNumber = extractedAccountNumber.length >= 5; // At least 5 digits to be considered valid
      
      let recipientAccountMatch = true;
      if (hasAccountNumber) {
        recipientAccountMatch = accountNumbersMatch(
          extractedAccountNumber,
          paymentAccount.accountNumber
        );
      }

      // Recipient name is REQUIRED - account number is optional if not visible in screenshot
      if (!recipientNameMatch) {
        return res.status(400).json({
          success: false,
          message: 'Recipient name does not match. Please pay to the correct account shown in the system.',
          data: {
            expectedRecipient: paymentAccount.accountHolderFullName,
            expectedAccount: paymentAccount.accountNumber,
            extractedRecipient: extractedData.recipientName || '(not found)',
            extractedAccount: extractedAccountNumber || '(not visible in screenshot)',
            note: hasAccountNumber ? '' : 'Account number not visible in screenshot - relying on recipient name match'
          }
        });
      }

      // If account number was extracted but doesn't match, reject
      if (hasAccountNumber && !recipientAccountMatch) {
        return res.status(400).json({
          success: false,
          message: 'Account number does not match. Please pay to the correct account shown in the system.',
          data: {
            expectedRecipient: paymentAccount.accountHolderFullName,
            expectedAccount: paymentAccount.accountNumber,
            extractedRecipient: extractedData.recipientName,
            extractedAccount: extractedAccountNumber
          }
        });
      }

      // 5. Validate amount - must be >= plan amount
      if (extractedData.amount < plan.amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount is insufficient',
          data: {
            requiredAmount: plan.amount,
            paidAmount: extractedData.amount,
            difference: plan.amount - extractedData.amount
          }
        });
      }

      // 6. Check if transaction ID already exists (duplicate payment)
      const existingTransaction = await PaymentTransaction.findOne({
        transactionId: extractedData.transactionId
      });

      if (existingTransaction) {
        return res.status(409).json({
          success: false,
          message: 'This payment has already been processed. You already have access. Please do not pay again.',
          data: {
            transactionId: existingTransaction.transactionId,
            status: existingTransaction.verificationStatus,
            planName: plan.planName
          }
        });
      }

      // 7. Parse payment date
      let paymentDate;
      try {
        paymentDate = new Date(extractedData.paymentDate);
        if (isNaN(paymentDate.getTime())) {
          paymentDate = new Date();
        }
      } catch {
        paymentDate = new Date();
      }

      // 8. Calculate premium expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

      // 9. Use payment account number if OCR didn't extract recipient account number
      // (Some screenshots don't show the full account number, so we use the configured account)
      const extractedAccountNum = extractedData.recipientAccountNumber?.trim();
      const recipientAccountNumber = (extractedAccountNum && extractedAccountNum.length >= 5) 
                                    ? extractedAccountNum 
                                    : paymentAccount.accountNumber;

      // 10. Create payment transaction
      const paymentTransaction = new PaymentTransaction({
        transactionId: extractedData.transactionId,
        studentId,
        planId,
        senderName: extractedData.senderName,
        senderAccountNumber: extractedData.senderAccountNumber || '',
        recipientName: extractedData.recipientName,
        recipientAccountNumber: recipientAccountNumber,
        paidAmount: extractedData.amount,
        paymentDate,
        screenshotPath: cloudinaryResult.secure_url,
        verificationStatus: 'approved',
        expiresAt
      });

      await paymentTransaction.save();

      res.status(201).json({
        success: true,
        message: 'Payment verified successfully. You now have premium access!',
        data: {
          transactionId: paymentTransaction.transactionId,
          planName: plan.planName,
          amount: paymentTransaction.paidAmount,
          verificationStatus: paymentTransaction.verificationStatus,
          expiresAt: paymentTransaction.expiresAt
        }
      });
    } catch (error) {
      console.error('Payment upload error:', error);

      // Cleanup Cloudinary on failure
      if (cloudinaryResult?.public_id) {
        try {
          await cloudinary.v2.uploader.destroy(cloudinaryResult.public_id);
        } catch (cleanupErr) {
          console.error('Cloudinary cleanup failed:', cleanupErr);
        }
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process payment screenshot',
        error: error.message
      });
    }
  }

  /**
   * Get payment history for current student
   */
  static async getPaymentHistory(req, res) {
    try {
      const studentId = req.user?.id;
      const transactions = await PaymentTransaction.find({ studentId })
        .populate('planId', 'planName amount durationDays features')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment history',
        error: error.message
      });
    }
  }

  /**
   * Get payment status by transaction ID
   */
  static async getPaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;
      const studentId = req.user?.id;

      const transaction = await PaymentTransaction.findOne({
        transactionId,
        studentId
      }).populate('planId', 'planName amount durationDays');

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Payment transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment status',
        error: error.message
      });
    }
  }

  /**
   * Check if student has active premium access
   */
  static async checkPremiumAccess(req, res) {
    try {
      const studentId = req.user?.id;
      const now = new Date();

      const activePayment = await PaymentTransaction.findOne({
        studentId,
        verificationStatus: 'approved',
        $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }]
      })
        .populate('planId', 'planName features durationDays')
        .sort({ expiresAt: -1 });

      res.status(200).json({
        success: true,
        hasAccess: !!activePayment,
        data: activePayment
          ? {
              planName: activePayment.planId?.planName,
              features: activePayment.planId?.features,
              expiresAt: activePayment.expiresAt
            }
          : null
      });
    } catch (error) {
      console.error('Check premium access error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check premium access',
        error: error.message
      });
    }
  }

  // ========== ADMIN ROUTES ==========

  static async getAllPayments(req, res) {
    try {
      const { status, studentId, startDate, endDate } = req.query;
      const filter = {};

      if (status) filter.verificationStatus = status;
      if (studentId) filter.studentId = studentId;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const transactions = await PaymentTransaction.find(filter)
        .populate('planId', 'planName amount durationDays')
        .populate('studentId', 'username')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payments',
        error: error.message
      });
    }
  }

  static async updatePaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;
      const { status, rejectionReason } = req.body;

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Use: pending, approved, rejected'
        });
      }

      const transaction = await PaymentTransaction.findOne({ transactionId });
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Payment transaction not found'
        });
      }

      transaction.verificationStatus = status;
      if (status === 'rejected' && rejectionReason) {
        transaction.rejectionReason = rejectionReason;
      }
      await transaction.save();

      res.status(200).json({
        success: true,
        message: 'Payment status updated',
        data: {
          transactionId: transaction.transactionId,
          status: transaction.verificationStatus
        }
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update status',
        error: error.message
      });
    }
  }
}

export { PaymentController, upload };

