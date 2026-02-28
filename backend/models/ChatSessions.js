import mongoose from 'mongoose';

const chatSessionsSchema = new mongoose.Schema({
  summary: {
    type: String,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'Student ID is required'],
    validate: {
      validator: async function(value) {
        const user = await mongoose.model('Users').findById(value);
        return user && !user.isDeleted;
      },
      message: 'Referenced student does not exist, has been deleted'
    }
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['interaction', 'quiz'],
      message: 'Type must be either interaction or quiz'
    }
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

// Index for studentId to optimize queries
chatSessionsSchema.index({ studentId: 1 });

// Index for type to optimize queries
chatSessionsSchema.index({ type: 1 });

// Index for soft delete queries
chatSessionsSchema.index({ isDeleted: 1 });

// Update the updatedAt field before saving
chatSessionsSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Static method to find active chat sessions
chatSessionsSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find chat sessions by student
chatSessionsSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId, isDeleted: false })
    .sort({ createdAt: -1 });
};

// Static method to find chat sessions by type
chatSessionsSchema.statics.findByType = function(type) {
  return this.find({ type, isDeleted: false })
    .sort({ createdAt: -1 });
};

// Static method to find chat sessions by student and type
chatSessionsSchema.statics.findByStudentAndType = function(studentId, type) {
  return this.find({ studentId, type, isDeleted: false })
    .sort({ createdAt: -1 });
};

// Instance method to mark as deleted
chatSessionsSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('ChatSessions', chatSessionsSchema);