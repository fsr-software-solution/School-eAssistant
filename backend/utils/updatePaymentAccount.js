import PaymentAccount from '../models/PaymentAccount.js';

/**
 * One-time script to update payment account recipient name
 * Run with: node backend/utils/updatePaymentAccount.js
 */
const updatePaymentAccount = async () => {
  try {
    const existing = await PaymentAccount.getActiveAccount();
    if (!existing) {
      console.log('No active payment account found. Creating new one...');
      const newAccount = new PaymentAccount({
        accountNumber: process.env.DEFAULT_PAYMENT_ACCOUNT_NUMBER || '1000123456789',
        accountHolderFullName: 'YARED SHIMELIS TESHOME',
        bankName: 'CBE',
        isActive: true
      });
      await newAccount.save();
      console.log('✅ Payment account created:', newAccount);
      return;
    }

    console.log('Current account:', {
      accountNumber: existing.accountNumber,
      accountHolderFullName: existing.accountHolderFullName,
      bankName: existing.bankName
    });

    // Update to YARED SHIMELIS TESHOME
    existing.accountHolderFullName = 'YARED SHIMELIS TESHOME';
    await existing.save();

    console.log('✅ Payment account updated successfully!');
    console.log('New account details:', {
      accountNumber: existing.accountNumber,
      accountHolderFullName: existing.accountHolderFullName,
      bankName: existing.bankName
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating payment account:', error);
    process.exit(1);
  }
};

updatePaymentAccount();