import PaymentAccount from '../models/PaymentAccount.js';
import { z } from 'zod';

const accountSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  accountHolderFullName: z.string().min(2, 'Recipient full name is required'),
  bankName: z.string().optional()
});

class PaymentAccountController {
 
  static async getAccount(req, res) {
    try {
      const account = await PaymentAccount.findOne({isActive: true});
      res.status(200).json({
        success: true,
        data: account || null
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

  static async upsertAccount(req, res) {
    try {
      const validation = accountSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid account data',
          errors: validation.error.errors
        });
      }

      const { accountNumber, accountHolderFullName, bankName } = validation.data;
      
      let account = await PaymentAccount.findOne({isActive: true});
      if (account) {
        account.accountNumber = accountNumber
        account.accountHolderFullName = accountHolderFullName
        account.bankName = bankName
        await account.save()
      } else {
        account = await PaymentAccount.create({
          accountNumber,
          accountHolderFullName,
          bankName: bankName || 'CBE'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Payment account updated successfully. Students will pay to this account.',
        data: account
      });
    } catch (error) {
      console.error('Upsert payment account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment account',
        error: error.message
      });
    }
  }
}

export default PaymentAccountController;

