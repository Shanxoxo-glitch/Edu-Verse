const Attendance = require('../models/Attendance');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const { verifySignature, generateAuthMessage } = require('../config/web3');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private
exports.markAttendance = async (req, res, next) => {
  try {
    const {
      classroomId,
      session,
      verificationMethod = 'session',
      walletSignature,
      deviceInfo
    } = req.body;

    if (!classroomId || !session) {
      return next(new ErrorResponse('Classroom ID and session are required', 400));
    }

    // Verify classroom exists and user is enrolled
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    const isEnrolled = classroom.students.some(
      s => s.user.toString() === req.user.id && s.status === 'active'
    );
    const isOwner = classroom.owner.toString() === req.user.id;

    if (!isEnrolled && !isOwner) {
      return next(new ErrorResponse('Not enrolled in this classroom', 403));
    }

    // Check if attendance already marked for this session
    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      classroom: classroomId,
      session
    });

    if (existingAttendance) {
      return next(new ErrorResponse('Attendance already marked for this session', 400));
    }

    // Verify wallet signature if provided
    let isVerified = false;
    if (verificationMethod === 'wallet' && walletSignature) {
      if (!req.user.walletAddress) {
        return next(new ErrorResponse('No wallet address associated with account', 400));
      }

      const message = `Mark attendance for session: ${session}`;
      isVerified = verifySignature(message, walletSignature, req.user.walletAddress);

      if (!isVerified) {
        return next(new ErrorResponse('Invalid wallet signature', 401));
      }
    } else {
      isVerified = true; // Auto-verify for session-based attendance
    }

    // Create attendance record
    const attendance = await Attendance.create({
      user: req.user.id,
      classroom: classroomId,
      session,
      checkInTime: Date.now(),
      status: 'present',
      verificationMethod,
      walletSignature,
      ipAddress: req.ip,
      deviceInfo,
      isVerified
    });

    // Update classroom stats
    await Classroom.findByIdAndUpdate(classroomId, {
      $inc: { 'stats.totalAttendance': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out from session
// @route   PUT /api/attendance/:id/checkout
// @access  Private
exports.checkOut = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    // Check ownership
    if (attendance.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    if (attendance.checkOutTime) {
      return next(new ErrorResponse('Already checked out', 400));
    }

    attendance.checkOutTime = Date.now();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance stats for a classroom
// @route   GET /api/attendance/stats/:classroomId
// @access  Private (Owner/Admin)
exports.getClassroomStats = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify classroom and authorization
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    if (classroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Get attendance stats
    const stats = await Attendance.getClassroomStats(classroomId, startDate, endDate);

    // Get attendance by session
    const query = { classroom: classroomId };
    if (startDate && endDate) {
      query.checkInTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceBySession = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$session',
          totalAttendees: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Get top attendees
    const topAttendees = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$user',
          attendanceCount: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { attendanceCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          avatarData: '$userInfo.avatarData',
          attendanceCount: 1,
          totalDuration: 1,
          avgDuration: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overallStats: stats,
        attendanceBySession,
        topAttendees,
        totalStudents: classroom.students.filter(s => s.status === 'active').length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's attendance stats
// @route   GET /api/attendance/my-stats
// @access  Private
exports.getMyStats = async (req, res, next) => {
  try {
    const { classroomId } = req.query;

    const stats = await Attendance.getUserStats(req.user.id, classroomId);

    // Get recent attendance
    const query = { user: req.user.id };
    if (classroomId) query.classroom = classroomId;

    const recentAttendance = await Attendance.find(query)
      .populate('classroom', 'title subject thumbnail')
      .sort('-checkInTime')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentAttendance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history for a classroom
// @route   GET /api/attendance/history/:classroomId
// @access  Private
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const { page = 1, limit = 20, session } = req.query;

    // Verify classroom access
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    const isOwner = classroom.owner.toString() === req.user.id;
    const isEnrolled = classroom.students.some(
      s => s.user.toString() === req.user.id && s.status === 'active'
    );

    if (!isOwner && !isEnrolled && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Build query
    const query = { classroom: classroomId };
    
    // If student, only show their attendance
    if (!isOwner && req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    if (session) {
      query.session = session;
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email avatarData')
      .sort('-checkInTime')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: attendance.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance status (for educators)
// @route   PUT /api/attendance/:id/status
// @access  Private (Educator/Admin)
exports.updateAttendanceStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const attendance = await Attendance.findById(req.params.id)
      .populate('classroom', 'owner');

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    // Check authorization
    if (attendance.classroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Validate status
    const validStatuses = ['present', 'late', 'absent', 'excused'];
    if (!validStatuses.includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    attendance.status = status;
    if (notes) attendance.notes = notes;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance status updated',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard (top learners)
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { classroomId, type = 'tokens', limit = 10 } = req.query;

    let query = { isActive: true };
    if (classroomId) {
      query.classroomsJoined = classroomId;
    }

    let sortField = '-tokensEarned';
    if (type === 'achievements') {
      sortField = '-achievements';
    }

    const leaderboard = await User.find(query)
      .select('name avatarData tokensEarned achievements institution')
      .sort(sortField)
      .limit(parseInt(limit));

    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user._id,
        name: user.name,
        avatarData: user.avatarData,
        institution: user.institution
      },
      tokensEarned: user.tokensEarned,
      achievementCount: user.achievements.length
    }));

    res.status(200).json({
      success: true,
      data: rankedLeaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private (Educator/Admin)
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const { classroomId, period = '30' } = req.query;

    if (!classroomId) {
      return next(new ErrorResponse('Classroom ID is required', 400));
    }

    // Verify authorization
    const classroom = await Classroom.findById(classroomId)
      .populate('quizzes');

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    if (classroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get attendance trends
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          classroom: classroom._id,
          checkInTime: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get quiz performance
    const quizPerformance = classroom.quizzes.map(quiz => ({
      title: quiz.title,
      averageScore: quiz.stats.averageScore,
      passRate: quiz.stats.passRate,
      totalAttempts: quiz.stats.totalAttempts
    }));

    // Get student engagement
    const studentEngagement = await Attendance.aggregate([
      {
        $match: {
          classroom: classroom._id,
          checkInTime: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$user',
          attendanceCount: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          attendanceCount: 1,
          totalDuration: 1,
          engagementScore: {
            $add: [
              { $multiply: ['$attendanceCount', 10] },
              { $divide: ['$totalDuration', 6] }
            ]
          }
        }
      },
      { $sort: { engagementScore: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        classroom: {
          title: classroom.title,
          totalStudents: classroom.students.filter(s => s.status === 'active').length,
          totalQuizzes: classroom.quizzes.length
        },
        attendanceTrend,
        quizPerformance,
        studentEngagement,
        period: `Last ${period} days`
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
