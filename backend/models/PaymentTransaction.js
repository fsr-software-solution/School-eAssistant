import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'Student ID is required']
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PremiumPlan',
    required: [true, 'Plan ID is required']
  },
  // Extracted from screenshot via OCR + Gemini
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderAccountNumber: {
    type: String,
    trim: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  recipientAccountNumber: {
    type: String,
    required: false, // Optional - may not be visible in screenshot, will use payment account number as fallback
    trim: true,
    default: ''
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true
  },
  screenshotPath: {
    type: String,
    required: true,
    trim: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    default: null // Premium access expiry
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

// transactionId already has unique index via unique: true
paymentTransactionSchema.index({ studentId: 1 });
paymentTransactionSchema.index({ verificationStatus: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

// Note: updatedAt is automatically handled by timestamps: true option
// No need for manual pre-save hook

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);

