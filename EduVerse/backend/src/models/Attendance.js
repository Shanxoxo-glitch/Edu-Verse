const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  session: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: Date,
  duration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent', 'excused'],
    default: 'present'
  },
  verificationMethod: {
    type: String,
    enum: ['wallet', 'session', 'manual', 'auto'],
    default: 'session'
  },
  walletSignature: String,
  ipAddress: String,
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  notes: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for unique attendance per session
AttendanceSchema.index({ user: 1, classroom: 1, session: 1 }, { unique: true });
AttendanceSchema.index({ classroom: 1, checkInTime: -1 });
AttendanceSchema.index({ user: 1, checkInTime: -1 });

// Calculate duration before saving
AttendanceSchema.pre('save', function(next) {
  if (this.checkOutTime && this.checkInTime) {
    this.duration = Math.floor((this.checkOutTime - this.checkInTime) / 1000 / 60);
  }
  next();
});

// Static method to get attendance stats for a classroom
AttendanceSchema.statics.getClassroomStats = async function(classroomId, startDate, endDate) {
  const match = {
    classroom: mongoose.Types.ObjectId(classroomId)
  };
  
  if (startDate && endDate) {
    match.checkInTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get user attendance stats
AttendanceSchema.statics.getUserStats = async function(userId, classroomId = null) {
  const match = {
    user: mongoose.Types.ObjectId(userId)
  };
  
  if (classroomId) {
    match.classroom = mongoose.Types.ObjectId(classroomId);
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$classroom',
        totalSessions: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' }
      }
    },
    {
      $lookup: {
        from: 'classrooms',
        localField: '_id',
        foreignField: '_id',
        as: 'classroomInfo'
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
