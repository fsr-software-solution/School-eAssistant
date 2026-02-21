import mongoose from 'mongoose';

const unitsSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Books',
    required: [true, 'Book ID is required'],
    validate: {
      validator: async function(value) {
        const book = await mongoose.model('Books').findById(value);
        return book && !book.isDeleted;
      },
      message: 'Referenced book does not exist or has been deleted'
    }
  },
  unitNumber: {
    type: Number,
    required: [true, 'Unit number is required'],
    min: [1, 'Unit number must be at least 1']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  startingPage: {
    type: Number,
    required: [true, 'Starting page is required'],
    min: [1, 'Starting page must be at least 1']
  },
  endingPage: {
    type: Number,
    required: [true, 'Ending page is required'],
    min: [1, 'Ending page must be at least 1'],
    validate: {
      validator: function(value) {
        return value >= this.startingPage;
      },
      message: 'Ending page must be greater than or equal to starting page'
    }
  },
  summary: {
    type: String,
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

// Compound index for bookId and unitNumber to ensure uniqueness within a book
unitsSchema.index({ bookId: 1, unitNumber: 1 }, { unique: true });

// Index for soft delete queries
unitsSchema.index({ isDeleted: 1 });

// Update the updatedAt field before saving
unitsSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Static method to find active units
unitsSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find units by book
unitsSchema.statics.findByBook = function(bookId) {
  return this.find({ bookId, isDeleted: false }).sort({ unitNumber: 1 });
};

// Instance method to mark as deleted
unitsSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Units', unitsSchema);