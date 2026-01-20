const Quiz = require('../models/Quiz');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const { uploadJSON } = require('../config/ipfs');

// @desc    Create quiz
// @route   POST /api/quiz/create
// @access  Private (Educator/Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      classroomId,
      questions,
      duration,
      passingScore,
      tokenReward,
      settings,
      schedule
    } = req.body;

    // Verify classroom exists and user is owner
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    if (classroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to create quiz in this classroom', 403));
    }

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      classroom: classroomId,
      creator: req.user.id,
      questions,
      duration,
      passingScore: passingScore || 60,
      tokenReward: tokenReward || 10,
      settings: settings || {},
      schedule: schedule || {}
    });

    // Add quiz to classroom
    await Classroom.findByIdAndUpdate(classroomId, {
      $push: { quizzes: quiz._id },
      $inc: { 'stats.totalQuizzes': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start quiz (get questions)
// @route   POST /api/quiz/:id/start
// @access  Private
exports.startQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('classroom', 'title owner students');

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    // Check if user is enrolled in classroom
    const isEnrolled = quiz.classroom.students.some(
      s => s.user.toString() === req.user.id && s.status === 'active'
    );

    if (!isEnrolled && quiz.classroom.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not enrolled in this classroom', 403));
    }

    // Check if quiz is scheduled
    if (quiz.schedule.isScheduled) {
      const now = new Date();
      if (quiz.schedule.startDate && now < quiz.schedule.startDate) {
        return next(new ErrorResponse('Quiz has not started yet', 400));
      }
      if (quiz.schedule.endDate && now > quiz.schedule.endDate) {
        return next(new ErrorResponse('Quiz has ended', 400));
      }
    }

    // Check if user can attempt
    if (!quiz.canUserAttempt(req.user.id)) {
      return next(new ErrorResponse('Maximum attempts reached', 400));
    }

    // Prepare questions (remove correct answers)
    let questions = quiz.questions.map((q, index) => ({
      index,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
      difficulty: q.difficulty
    }));

    // Shuffle questions if enabled
    if (quiz.settings.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Shuffle options if enabled
    if (quiz.settings.shuffleOptions) {
      questions = questions.map(q => ({
        ...q,
        options: q.options ? q.options.sort(() => Math.random() - 0.5) : q.options
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        totalPoints: quiz.totalPoints,
        passingScore: quiz.passingScore,
        questions,
        startedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quiz/:id/submit
// @access  Private
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, startedAt } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    // Calculate time spent
    const completedAt = new Date();
    const timeSpent = Math.floor((completedAt - new Date(startedAt)) / 1000 / 60);

    // Check if time limit exceeded
    if (timeSpent > quiz.duration) {
      return next(new ErrorResponse('Time limit exceeded', 400));
    }

    // Grade answers
    let correctCount = 0;
    let pointsEarned = 0;
    const gradedAnswers = [];

    answers.forEach(answer => {
      const question = quiz.questions[answer.questionIndex];
      let isCorrect = false;

      // Check answer based on question type
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        isCorrect = answer.answer === question.correctAnswer;
      } else if (question.type === 'short-answer') {
        isCorrect = answer.answer.toLowerCase().trim() === 
                   question.correctAnswer.toLowerCase().trim();
      }

      if (isCorrect) {
        correctCount++;
        pointsEarned += question.points;
      }

      gradedAnswers.push({
        questionIndex: answer.questionIndex,
        answer: answer.answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
        correctAnswer: quiz.settings.showCorrectAnswers ? question.correctAnswer : undefined,
        explanation: quiz.settings.showCorrectAnswers ? question.explanation : undefined
      });
    });

    // Calculate score percentage
    const score = (pointsEarned / quiz.totalPoints) * 100;
    const passed = score >= quiz.passingScore;

    // Calculate tokens awarded
    let tokensAwarded = 0;
    if (passed) {
      tokensAwarded = quiz.tokenReward;
      
      // Bonus for perfect score
      if (score === 100) {
        tokensAwarded += quiz.bonusTokens.perfectScore;
      }
      
      // Bonus for fast completion (within 70% of time limit)
      if (timeSpent <= quiz.duration * 0.7) {
        tokensAwarded += quiz.bonusTokens.fastCompletion;
      }

      // Award tokens to user
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { tokensEarned: tokensAwarded }
      });
    }

    // Save attempt
    quiz.attempts.push({
      user: req.user.id,
      answers: gradedAnswers,
      score,
      pointsEarned,
      tokensAwarded,
      startedAt: new Date(startedAt),
      completedAt,
      timeSpent,
      passed
    });

    // Update quiz stats
    quiz.updateStats();
    await quiz.save();

    res.status(200).json({
      success: true,
      message: passed ? 'Quiz passed! Tokens awarded.' : 'Quiz completed.',
      data: {
        score,
        pointsEarned,
        totalPoints: quiz.totalPoints,
        correctCount,
        totalQuestions: quiz.questions.length,
        tokensAwarded,
        passed,
        timeSpent,
        answers: quiz.settings.showResultsImmediately ? gradedAnswers : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz results
// @route   GET /api/quiz/:id/results
// @access  Private
exports.getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('attempts.user', 'name avatarData');

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    // Check authorization
    const classroom = await Classroom.findById(quiz.classroom);
    const isOwner = classroom.owner.toString() === req.user.id;
    const isEnrolled = classroom.students.some(
      s => s.user.toString() === req.user.id && s.status === 'active'
    );

    if (!isOwner && !isEnrolled && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // If student, only show their attempts
    let attempts = quiz.attempts;
    if (!isOwner && req.user.role !== 'admin') {
      attempts = attempts.filter(a => a.user._id.toString() === req.user.id);
    }

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          totalPoints: quiz.totalPoints,
          passingScore: quiz.passingScore
        },
        attempts,
        stats: quiz.stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's best attempt
// @route   GET /api/quiz/:id/my-best
// @access  Private
exports.getMyBestAttempt = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    const bestAttempt = quiz.getUserBestAttempt(req.user.id);

    if (!bestAttempt) {
      return next(new ErrorResponse('No attempts found', 404));
    }

    res.status(200).json({
      success: true,
      data: bestAttempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz
// @route   PUT /api/quiz/:id
// @access  Private (Creator only)
exports.updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    // Check authorization
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this quiz', 403));
    }

    const allowedUpdates = [
      'title', 'description', 'questions', 'duration', 
      'passingScore', 'tokenReward', 'settings', 'schedule'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quiz/:id
// @access  Private (Creator only)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    // Check authorization
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this quiz', 403));
    }

    // Soft delete
    quiz.isActive = false;
    await quiz.save();

    // Remove from classroom
    await Classroom.findByIdAndUpdate(quiz.classroom, {
      $pull: { quizzes: quiz._id }
    });

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue proof of learning certificate
// @route   POST /api/quiz/:id/certificate
// @access  Private
exports.issueCertificate = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('classroom', 'title subject')
      .populate('creator', 'name');

    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }

    // Get user's best attempt
    const bestAttempt = quiz.getUserBestAttempt(req.user.id);

    if (!bestAttempt || !bestAttempt.passed) {
      return next(new ErrorResponse('Must pass quiz to receive certificate', 400));
    }

    // Create certificate metadata
    const certificateData = {
      type: 'Proof of Learning Certificate',
      recipient: {
        name: req.user.name,
        walletAddress: req.user.walletAddress,
        userId: req.user.id
      },
      quiz: {
        title: quiz.title,
        classroom: quiz.classroom.title,
        subject: quiz.classroom.subject
      },
      achievement: {
        score: bestAttempt.score,
        pointsEarned: bestAttempt.pointsEarned,
        totalPoints: quiz.totalPoints,
        completedAt: bestAttempt.completedAt,
        tokensAwarded: bestAttempt.tokensAwarded
      },
      issuer: {
        name: quiz.creator.name,
        platform: 'EduVerse'
      },
      issuedAt: new Date().toISOString(),
      certificateId: `EDUVERSE-${Date.now()}-${req.user.id}`
    };

    // Upload to IPFS
    const ipfsResult = await uploadJSON(certificateData);

    if (!ipfsResult.success) {
      return next(new ErrorResponse('Failed to upload certificate to IPFS', 500));
    }

    // Add achievement to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        achievements: {
          title: `Completed: ${quiz.title}`,
          description: `Scored ${bestAttempt.score}% in ${quiz.classroom.title}`,
          earnedAt: Date.now(),
          nftHash: ipfsResult.hash
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateUrl: ipfsResult.url,
        ipfsHash: ipfsResult.hash,
        certificate: certificateData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
