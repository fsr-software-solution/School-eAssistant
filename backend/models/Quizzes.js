import mongoose from 'mongoose';

const quizzesSchema = new mongoose.Schema({
  chatSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSessions',
    required: [true, 'Chat session ID is required'],
    validate: {
      validator: async function(value) {
        const session = await mongoose.model('ChatSessions').findById(value);
        return session && !session.isDeleted && session.type === 'quiz';
      },
      message: 'Referenced chat session does not exist, has been deleted, or is not a quiz session'
    }
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
  },
  explanation: {
    type: String,
  },
  // Common attributes
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for chatSessionId to optimize queries
quizzesSchema.index({ chatSessionId: 1 });

// Index for soft delete queries
quizzesSchema.index({ isDeleted: 1 });

// Update the updatedAt field before saving
quizzesSchema.pre('save', function() {
  this.updatedAt = new Date();
  next();
});

// Static method to find active quizzes
quizzesSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find quizzes by chat session
quizzesSchema.statics.findByChatSession = function(chatSessionId) {
  return this.find({ chatSessionId, isDeleted: false })
    .sort({ createdAt: 1 });
};

// Instance method to mark as deleted
quizzesSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Quizzes', quizzesSchema);