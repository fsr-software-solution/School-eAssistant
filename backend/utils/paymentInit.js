import PaymentAccount from '../models/PaymentAccount.js';
import PremiumPlan from '../models/PremiumPlan.js';

/**
 * Initialize default payment account from env if configured
 * Admin can update via API later
 */
export const initializePaymentAccount = async () => {
  try {
    const accountNumber = process.env.DEFAULT_PAYMENT_ACCOUNT_NUMBER?.trim();
    const accountHolderName = process.env.DEFAULT_PAYMENT_ACCOUNT_HOLDER_NAME?.trim();
    const bankName = (process.env.DEFAULT_PAYMENT_BANK_NAME || 'CBE').trim();

    if (!accountNumber || !accountHolderName) {
      console.log('Payment account not configured. Add to .env: DEFAULT_PAYMENT_ACCOUNT_NUMBER, DEFAULT_PAYMENT_ACCOUNT_HOLDER_NAME');
      return;
    }

    const existing = await PaymentAccount.getActiveAccount();
    if (existing) {
      // Don't overwrite existing account - admin should update via API
      // Only update if env vars are provided AND account doesn't exist
      console.log('Payment account already configured:', {
        accountNumber: existing.accountNumber,
        accountHolderFullName: existing.accountHolderFullName
      });
      return;
    }

    await PaymentAccount.create({
      accountNumber,
      accountHolderFullName: accountHolderName,
      bankName,
      isActive: true
    });

    console.log('Default payment account initialized successfully');
  } catch (error) {
    console.error('Error initializing payment account:', error);
  }
};

/**
 * Initialize default premium plans if none exist
 */
export const initializePremiumPlans = async () => {
  try {
    const count = await PremiumPlan.countDocuments({ isDeleted: false });
    if (count > 0) {
      return;
    }

    await PremiumPlan.insertMany([
      {
        planName: 'Premium Monthly',
        description: 'Access to Quiz and AI Assistant for 30 days',
        amount: 99,
        durationDays: 30,
        features: ['quiz', 'ai_assistant']
      },
      {
        planName: 'Premium Yearly',
        description: 'Access to Quiz and AI Assistant for 365 days',
        amount: 999,
        durationDays: 365,
        features: ['quiz', 'ai_assistant']
      }
    ]);

    console.log('Default premium plans initialized');
  } catch (error) {
    console.error('Error initializing premium plans:', error);
  }
};

