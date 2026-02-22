import connectDb from '../config/database.js';
import PaymentAccount from '../models/PaymentAccount.js';

/**
 * Verify payment account in database
 */
const verifyPaymentAccount = async () => {
  try {
    await connectDb();
    console.log('Connected to database\n');

    // Get active account
    const activeAccount = await PaymentAccount.getActiveAccount();
    console.log('=== ACTIVE PAYMENT ACCOUNT ===');
    if (activeAccount) {
      console.log('Account Number:', activeAccount.accountNumber);
      console.log('Account Holder Name:', activeAccount.accountHolderFullName);
      console.log('Bank Name:', activeAccount.bankName);
      console.log('Is Active:', activeAccount.isActive);
      console.log('Updated At:', activeAccount.updatedAt);
    } else {
      console.log('No active account found!');
    }

    // Get all accounts
    const allAccounts = await PaymentAccount.find({}).sort({ updatedAt: -1 });
    console.log('\n=== ALL PAYMENT ACCOUNTS ===');
    console.log(`Total accounts: ${allAccounts.length}`);
    allAccounts.forEach((acc, index) => {
      console.log(`\nAccount ${index + 1}:`);
      console.log('  ID:', acc._id);
      console.log('  Account Number:', acc.accountNumber);
      console.log('  Account Holder Name:', acc.accountHolderFullName);
      console.log('  Bank Name:', acc.bankName);
      console.log('  Is Active:', acc.isActive);
      console.log('  Updated At:', acc.updatedAt);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyPaymentAccount();