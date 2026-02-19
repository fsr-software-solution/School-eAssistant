import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    default: 'multiple_choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: function() {
      return this.type === 'short_answer';
    }
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required'],
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    required: true
  },
  selectedAnswer: {
    type: mongoose.Schema.Types.Mixed
  },
  shortAnswer: {
    type: String
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0
  }
});

const attemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  answers: [answerSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeStarted: {
    type: Date,
    default: Date.now
  },
  timeCompleted: {
    type: Date
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Units',
    required: [true, 'Unit ID is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sections'
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number,
    default: 0,
    min: [0, 'Time limit cannot be negative']
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isGenerated: {
    type: Boolean,
    default: false
  },
  // Common attributes
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  attempts: [attemptSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'Creator is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  try {
    if (this.questions && Array.isArray(this.questions) && this.questions.length > 0) {
      this.totalPoints = this.questions.reduce((total, question) => {
        return total + (question.points || 1);
      }, 0);
    } else {
      this.totalPoints = 0;
    }
    this.updatedAt = new Date();
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    if (typeof next === 'function') {
      next(error);
    } else {
      console.error('next is not a function:', typeof next);
    }
  }
});

// Indexes for better performance
quizSchema.index({ unitId: 1 });
quizSchema.index({ sectionId: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ createdAt: -1 });

// Static methods
quizSchema.statics.findByUnit = function(unitId) {
  return this.find({ unitId, isActive: true })
    .populate('sectionId', 'title')
    .sort({ createdAt: -1 });
};

quizSchema.statics.findBySection = function(sectionId) {
  return this.find({ sectionId, isActive: true })
    .sort({ createdAt: -1 });
};

quizSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true })
    .populate('unitId', 'title')
    .sort({ createdAt: -1 });
};

quizSchema.statics.getQuizStats = async function(quizId) {
  const quiz = await this.findById(quizId);
  if (!quiz) return null;

  return {
    title: quiz.title,
    totalQuestions: quiz.questions.length,
    totalPoints: quiz.totalPoints,
    timeLimit: quiz.timeLimit,
    difficulty: quiz.difficulty,
    isGenerated: quiz.isGenerated
  };
};

export default mongoose.model('Quizzes', quizSchema);