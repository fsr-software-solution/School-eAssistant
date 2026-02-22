import mongoose from 'mongoose';

/**
 * PremiumPlan - Plans for premium features (Quiz, AI Assistant)
 * Admin can create, update, reduce prices, and manage plans
 */
const premiumPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  durationDays: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  features: {
    type: [String],
    required: true,
    default: []
  },
  isDeleted: {
    type: Boolean,
    default: false
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

// planName already has unique index via unique: true
premiumPlanSchema.index({ isDeleted: 1 });
premiumPlanSchema.index({ amount: 1 });

premiumPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

premiumPlanSchema.statics.getActivePlans = function () {
  return this.find({ isDeleted: false });
};

premiumPlanSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this.save();
};

premiumPlanSchema.methods.restore = function () {
  this.isDeleted = false;
  return this.save();
};

export default mongoose.model('PremiumPlan', premiumPlanSchema);

