import mongoose from 'mongoose';

const referencesSchema = new mongoose.Schema({
  interactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interactions',
    validate: {
      validator: async function(value) {
        if (!value) return true; // null is valid when referencing quiz
        const interaction = await mongoose.model('Interactions').findById(value);
        return interaction && !interaction.isDeleted;
      },
      message: 'Referenced interaction does not exist or has been deleted'
    }
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quizzes',
    validate: {
      validator: async function(value) {
        if (!value) return true; // null is valid when referencing interaction
        const quiz = await mongoose.model('Quizzes').findById(value);
        return quiz && !quiz.isDeleted;
      },
      message: 'Referenced quiz does not exist or has been deleted'
    }
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Books',
    validate: {
      validator: async function(value) {
        const book = await mongoose.model('Books').findById(value);
        return book && !book.isDeleted;
      },
      message: 'Referenced book does not exist or has been deleted'
    }
  },
  quotedText: {
    type: String,
    required: [true, 'Quoted text is required'],
  },
  pageNumber: {
    type: Number,
    required: [true, 'Page number is required'],
    min: [1, 'Page number must be at least 1']
  },
  lineFrom: {
    type: Number,
    min: [1, 'Line number must be at least 1']
  },
  lineTo: {
    type: Number,
    min: [1, 'Line number must be at least 1']
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

// Compound index to ensure a reference is linked to exactly one of interaction, quiz, or book
referencesSchema.index({ interactionId: 1, quizId: 1, bookId: 1 }, { unique: true });

// Index for interactionId to optimize queries
referencesSchema.index({ interactionId: 1 });

// Index for quizId to optimize queries
referencesSchema.index({ quizId: 1 });

// Index for bookId to optimize queries
referencesSchema.index({ bookId: 1 });

// Index for soft delete queries
referencesSchema.index({ isDeleted: 1 });

// Custom validation to ensure exactly one of interactionId, quizId, or bookId is provided
referencesSchema.pre('save', function() {
  this.updatedAt = new Date();
  
  const providedReferences = [this.interactionId, this.quizId, this.bookId].filter(Boolean);
  
  if (providedReferences.length === 0) {
    return next(new Error('Either interactionId, quizId, or bookId must be provided'));
  }
  
  if (providedReferences.length > 1) {
    return next(new Error('Reference cannot be linked to more than one entity (interaction, quiz, or book)'));
  }
  
  next();
});

// Static method to find active references
referencesSchema.statics.findActive = function() {
  return this.find({ isDeleted: false });
};

// Static method to find references by interaction
referencesSchema.statics.findByInteraction = function(interactionId) {
  return this.find({ interactionId, isDeleted: false });
};

// Static method to find references by quiz
referencesSchema.statics.findByQuiz = function(quizId) {
  return this.find({ quizId, isDeleted: false });
};

// Static method to find references by book
referencesSchema.statics.findByBook = function(bookId) {
  return this.find({ bookId, isDeleted: false });
};

// Instance method to mark as deleted
referencesSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('References', referencesSchema);