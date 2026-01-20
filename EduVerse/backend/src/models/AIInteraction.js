const mongoose = require('mongoose');

const AIInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    maxlength: [2000, 'Question cannot exceed 2000 characters']
  },
  aiResponse: {
    type: String,
    required: true
  },
  context: {
    subject: String,
    topic: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    }
  },
  metadata: {
    model: String,
    tokensUsed: Number,
    responseTime: Number,
    temperature: Number,
    maxTokens: Number
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    helpful: Boolean,
    comment: String,
    submittedAt: Date
  },
  conversationHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionId: String,
  language: {
    type: String,
    default: 'en'
  },
  isFollowUp: {
    type: Boolean,
    default: false
  },
  parentInteraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIInteraction'
  },
  tags: [String],
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String
}, {
  timestamps: true
});

// Indexes for faster queries
AIInteractionSchema.index({ user: 1, createdAt: -1 });
AIInteractionSchema.index({ classroom: 1, createdAt: -1 });
AIInteractionSchema.index({ sessionId: 1 });
AIInteractionSchema.index({ 'context.subject': 1 });

// Static method to get user interaction stats
AIInteractionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalInteractions: { $sum: 1 },
        avgRating: { $avg: '$feedback.rating' },
        totalTokensUsed: { $sum: '$metadata.tokensUsed' },
        avgResponseTime: { $avg: '$metadata.responseTime' },
        subjectBreakdown: {
          $push: '$context.subject'
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

// Static method to get popular topics
AIInteractionSchema.statics.getPopularTopics = async function(limit = 10) {
  const topics = await this.aggregate([
    { $match: { 'context.topic': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$context.topic',
        count: { $sum: 1 },
        avgRating: { $avg: '$feedback.rating' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
  
  return topics;
};

// Method to add conversation message
AIInteractionSchema.methods.addMessage = function(role, content) {
  this.conversationHistory.push({
    role,
    content,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('AIInteraction', AIInteractionSchema);
