const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
      default: 'multiple-choice'
    },
    options: [String],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    points: {
      type: Number,
      default: 1,
      min: 0
    },
    explanation: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  duration: {
    type: Number,
    required: [true, 'Please provide quiz duration in minutes'],
    min: 1
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  tokenReward: {
    type: Number,
    default: 10,
    min: 0
  },
  bonusTokens: {
    perfectScore: { type: Number, default: 5 },
    fastCompletion: { type: Number, default: 3 }
  },
  attempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionIndex: Number,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      pointsEarned: Number
    }],
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    pointsEarned: Number,
    tokensAwarded: Number,
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number,
    passed: Boolean
  }],
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    allowMultipleAttempts: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 3 },
    showResultsImmediately: { type: Boolean, default: true }
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    isScheduled: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total points before saving
QuizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  }
  next();
});

// Update stats after new attempt
QuizSchema.methods.updateStats = function() {
  const attempts = this.attempts;
  
  if (attempts.length === 0) return;
  
  this.stats.totalAttempts = attempts.length;
  this.stats.averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
  this.stats.passRate = (attempts.filter(a => a.passed).length / attempts.length) * 100;
  this.stats.averageTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / attempts.length;
};

// Get user's best attempt
QuizSchema.methods.getUserBestAttempt = function(userId) {
  const userAttempts = this.attempts.filter(
    a => a.user.toString() === userId.toString()
  );
  
  if (userAttempts.length === 0) return null;
  
  return userAttempts.reduce((best, current) => 
    current.score > best.score ? current : best
  );
};

// Check if user can attempt quiz
QuizSchema.methods.canUserAttempt = function(userId) {
  if (!this.settings.allowMultipleAttempts) {
    const hasAttempted = this.attempts.some(
      a => a.user.toString() === userId.toString()
    );
    return !hasAttempted;
  }
  
  const userAttempts = this.attempts.filter(
    a => a.user.toString() === userId.toString()
  );
  
  return userAttempts.length < this.settings.maxAttempts;
};

// Index for faster queries
QuizSchema.index({ classroom: 1, isActive: 1 });
QuizSchema.index({ 'attempts.user': 1 });

module.exports = mongoose.model('Quiz', QuizSchema);
