import mongoose from 'mongoose';

const chatSessionsSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    maxlength: [500, 'Summary cannot exceed 500 characters']
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
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['interaction', 'quiz'],
      message: 'Type must be either interaction or quiz'
    }
  },
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

chatSessionsSchema.index({ studentId: 1 });

chatSessionsSchema.index({ type: 1 });

chatSessionsSchema.index({ isDeleted: 1 });

chatSessionsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

chatSessionsSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

chatSessionsSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId, isDeleted: false })
    .sort({ createdAt: -1 });
};

chatSessionsSchema.statics.findByType = function(type) {
  return this.find({ type, isDeleted: false })
    .sort({ createdAt: -1 });
};

chatSessionsSchema.statics.findByStudentAndType = function(studentId, type) {
  return this.find({ studentId, type, isDeleted: false })
    .sort({ createdAt: -1 });
};

chatSessionsSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('ChatSessions', chatSessionsSchema);