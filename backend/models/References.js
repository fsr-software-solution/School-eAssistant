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
  quotedText: {
    type: String,
    required: [true, 'Quoted text is required'],
    maxlength: [1000, 'Quoted text cannot exceed 1000 characters']
  },
  pageNumber: {
    type: Number,
    required: [true, 'Page number is required'],
    min: [1, 'Page number must be at least 1']
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

// Index for interactionId to optimize queries
referencesSchema.index({ interactionId: 1 });

// Index for quizId to optimize queries
referencesSchema.index({ quizId: 1 });

// Index for soft delete queries
referencesSchema.index({ isDeleted: 1 });

// Custom validation to ensure exactly one of interactionId or quizId is provided
referencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  if (!this.interactionId && !this.quizId) {
    return next(new Error('Either interactionId or quizId must be provided'));
  }
  
  if (this.interactionId && this.quizId) {
    return next(new Error('Reference cannot be linked to both an interaction and a quiz'));
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

// Instance method to mark as deleted
referencesSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('References', referencesSchema);