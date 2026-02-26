import PaymentTransaction from '../models/PaymentTransaction.js';

/**
 * Middleware to check if user has active premium access
 * Use this for routes that require premium subscription
 */
const requirePremiumAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const studentId = req.user.id;
    const now = new Date();

    const activePayment = await PaymentTransaction.findOne({
      studentId,
      verificationStatus: 'approved',
      $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }]
    });

    if (!activePayment) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required. Please subscribe to a premium plan.',
        data: {
          hasAccess: false,
          redirectTo: '/payment/plans'
        }
      });
    }

    // Attach premium info to request for use in controllers
    req.premiumAccess = {
      hasAccess: true,
      transactionId: activePayment.transactionId,
      expiresAt: activePayment.expiresAt,
      planId: activePayment.planId
    };

    next();
  } catch (error) {
    console.error('Premium access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify premium access',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user is a student (not admin)
 * Useful for payment routes that should only be accessible to students
 */
const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to students'
    });
  }

  next();
};

export { requirePremiumAccess, studentOnly };




