import mongoose from 'mongoose';

const booksSchema = new mongoose.Schema({
  gradeLevel: {
    type: String,
    required: [true, 'Grade level is required'],
    enum: {
      values: ['G-7', 'G-8', 'G-9', 'G-10', 'G-11', 'G-12'],
      message: 'Grade level must be one of: G-7, G-8, G-9, G-10, G-11, G-12'
    }
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  totalPages: {
    type: Number,
    required: [true, 'Total pages is required'],
    min: [1, 'Total pages must be at least 1']
  },
  toc: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  summary: {
    type: String,
    maxlength: [2000, 'Summary cannot exceed 2000 characters']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true,
    maxlength: [50, 'Version cannot exceed 50 characters']
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

// Unique index for grade level + subject + version
// booksSchema.index({ gradeLevel: 1, subject: 1, version: 1 }, { unique: true });

// Update the updatedAt field before saving
booksSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Index for soft delete queries
booksSchema.index({ isDeleted: 1 });

// Static method to find active books
booksSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find books by grade level
booksSchema.statics.findByGradeLevel = function(gradeLevel) {
  return this.find({ gradeLevel, isDeleted: false });
};

// Static method to find books by subject
booksSchema.statics.findBySubject = function(subject) {
  return this.find({ subject, isDeleted: false });
};

// Instance method to mark as deleted
booksSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Books', booksSchema);