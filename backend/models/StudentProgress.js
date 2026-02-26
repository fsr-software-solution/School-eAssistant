import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema({
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
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sections',
    required: [true, 'Section ID is required'],
    validate: {
      validator: async function(value) {
        const section = await mongoose.model('Sections').findById(value);
        return section && !section.isDeleted;
      },
      message: 'Referenced section does not exist or has been deleted'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['not started', 'in progress', 'completed'],
      message: 'Status must be one of: not started, in progress, completed'
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

// Unique index for studentId + sectionId
studentProgressSchema.index({ studentId: 1, sectionId: 1 }, { unique: true });

// Index for studentId to optimize queries
studentProgressSchema.index({ studentId: 1 });

// Index for sectionId to optimize queries
studentProgressSchema.index({ sectionId: 1 });

// Index for status to optimize queries
studentProgressSchema.index({ status: 1 });

// Index for soft delete queries
studentProgressSchema.index({ isDeleted: 1 });

// Update the updatedAt field before saving
studentProgressSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Static method to find active student progress
studentProgressSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find progress by student
studentProgressSchema.statics.findByStudent = function(studentId) {
  return this.find({ studentId, isDeleted: false })
    .populate('sectionId', 'title sectionNumber unitId')
    .populate('unitId', 'title unitNumber')
    .sort({ updatedAt: -1 });
};

// Static method to find progress by section
studentProgressSchema.statics.findBySection = function(sectionId) {
  return this.find({ sectionId, isDeleted: false })
    .populate('studentId', 'username');
};

// Static method to find progress by student and section
studentProgressSchema.statics.findByStudentAndSection = function(studentId, sectionId) {
  return this.findOne({ studentId, sectionId, isDeleted: false });
};

// Static method to find progress by status
studentProgressSchema.statics.findByStatus = function(status) {
  return this.find({ status, isDeleted: false });
};

// Instance method to mark as deleted
studentProgressSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('StudentProgress', studentProgressSchema);