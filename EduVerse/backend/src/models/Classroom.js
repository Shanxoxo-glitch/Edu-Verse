const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a classroom title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    enum: ['Mathematics', 'Science', 'History', 'Literature', 'Computer Science', 
           'Art', 'Music', 'Languages', 'Business', 'Engineering', 'Other']
  },
  nftId: {
    type: String,
    unique: true,
    sparse: true
  },
  nftContractAddress: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid contract address format'
    }
  },
  nftMetadataURI: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessType: {
    type: String,
    enum: ['public', 'private', 'nft-gated'],
    default: 'public'
  },
  accessToken: {
    type: String,
    unique: true,
    sparse: true
  },
  maxStudents: {
    type: Number,
    default: 50,
    min: 1,
    max: 500
  },
  students: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'removed'],
      default: 'active'
    }
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String,
    timezone: { type: String, default: 'UTC' }
  }],
  events: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['lecture', 'quiz', 'assignment', 'discussion', 'exam', 'other']
    },
    startTime: Date,
    endTime: Date,
    isLive: { type: Boolean, default: false },
    recordingUrl: String
  }],
  materials: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'link', 'ipfs']
    },
    url: String,
    ipfsHash: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  settings: {
    allowChat: { type: Boolean, default: true },
    allowVoice: { type: Boolean, default: true },
    allowScreenShare: { type: Boolean, default: false },
    recordSessions: { type: Boolean, default: false },
    aiTutorEnabled: { type: Boolean, default: true }
  },
  stats: {
    totalSessions: { type: Number, default: 0 },
    totalAttendance: { type: Number, default: 0 },
    averageAttendance: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  thumbnail: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
ClassroomSchema.index({ owner: 1, isActive: 1 });
ClassroomSchema.index({ 'students.user': 1 });
ClassroomSchema.index({ subject: 1, isActive: 1 });

// Virtual for current student count
ClassroomSchema.virtual('currentStudentCount').get(function() {
  return this.students.filter(s => s.status === 'active').length;
});

// Virtual for available slots
ClassroomSchema.virtual('availableSlots').get(function() {
  return this.maxStudents - this.currentStudentCount;
});

// Method to check if classroom is full
ClassroomSchema.methods.isFull = function() {
  return this.currentStudentCount >= this.maxStudents;
};

// Method to check if user is enrolled
ClassroomSchema.methods.isUserEnrolled = function(userId) {
  return this.students.some(
    s => s.user.toString() === userId.toString() && s.status === 'active'
  );
};

// Generate unique access token
ClassroomSchema.methods.generateAccessToken = function() {
  const token = require('crypto').randomBytes(16).toString('hex');
  this.accessToken = token;
  return token;
};

module.exports = mongoose.model('Classroom', ClassroomSchema);
