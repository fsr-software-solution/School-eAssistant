import mongoose from 'mongoose';

const paymentAccountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  accountHolderFullName: {
    type: String,
    required: [true, 'Recipient full name is required for verification'],
    trim: true
  },
  bankName: {
    type: String,
    trim: true,
    default: 'CBE'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

paymentAccountSchema.statics.getActiveAccount = function () {
  return this.findOne({ isActive: true }).sort({ updatedAt: -1 });
};

export default mongoose.model('PaymentAccount', paymentAccountSchema);