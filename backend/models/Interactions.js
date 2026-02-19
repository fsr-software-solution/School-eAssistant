import mongoose from 'mongoose';

const interactionsSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSessions',
    required: [true, 'Session ID is required'],
    validate: {
      validator: async function(value) {
        const session = await mongoose.model('ChatSessions').findById(value);
        return session && !session.isDeleted;
      },
      message: 'Referenced session does not exist or has been deleted'
    }
  },
  chatSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSessions',
    required: [true, 'Chat session ID is required'],
    validate: {
      validator: async function(value) {
        const session = await mongoose.model('ChatSessions').findById(value);
        return session && !session.isDeleted;
      },
      message: 'Referenced chat session does not exist or has been deleted'
    }
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'Student ID is required'],
    validate: {
      validator: async function(value) {
        const user = await mongoose.model('Users').findById(value);
        return user && !user.isDeleted && user.role === 'student';
      },
      message: 'Referenced student does not exist, has been deleted, or is not a student'
    }
  },
  studentQuestion: {
    type: String,
    required: [true, 'Student question is required'],
    maxlength: [2000, 'Student question cannot exceed 2000 characters']
  },
  aiAnswer: {
    type: String,
    required: [true, 'AI answer is required'],
    maxlength: [5000, 'AI answer cannot exceed 5000 characters']
  },
  confidenceScore: {
    type: Number,
    min: [0, 'Confidence score must be between 0 and 1'],
    max: [1, 'Confidence score must be between 0 and 1']
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

// Index for sessionId to optimize queries
interactionsSchema.index({ sessionId: 1 });

// Index for chatSessionId to optimize queries
interactionsSchema.index({ chatSessionId: 1 });

// Index for studentId to optimize queries
interactionsSchema.index({ studentId: 1 });

// Index for soft delete queries
interactionsSchema.index({ isDeleted: 1 });

// Update the updatedAt field before saving
interactionsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find active interactions
interactionsSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find interactions by session
interactionsSchema.statics.findBySession = function(sessionId) {
  return this.find({ sessionId, isDeleted: false })
    .sort({ createdAt: 1 });
};

// Static method to find interactions by chat session
interactionsSchema.statics.findByChatSession = function(chatSessionId) {
  return this.find({ chatSessionId, isDeleted: false })
    .sort({ createdAt: 1 });
};

// Static method to find interactions by student
interactionsSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId, isDeleted: false })
    .sort({ createdAt: -1 });
};

interactionsSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Interactions', interactionsSchema);