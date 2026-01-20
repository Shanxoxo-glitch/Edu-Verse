const AIInteraction = require('../models/AIInteraction');
const Classroom = require('../models/Classroom');
const { ErrorResponse } = require('../middleware/errorHandler');
const OpenAI = require('openai');

// Initialize OpenAI (optional - only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// System prompt for AI tutor
const SYSTEM_PROMPT = `You are an intelligent AI tutor in EduVerse, a 3D metaverse educational platform. Your role is to:
1. Help students understand complex concepts in a simple, engaging way
2. Provide step-by-step explanations
3. Encourage critical thinking with follow-up questions
4. Adapt your teaching style to the student's level
5. Be patient, supportive, and encouraging
6. Use examples and analogies to clarify concepts
7. Keep responses concise but comprehensive (max 500 words)
8. If asked about topics outside education, politely redirect to learning

Always maintain a friendly, professional tone suitable for students of all ages.`;

// @desc    Ask AI tutor a question
// @route   POST /api/ai-tutor
// @access  Private
exports.askAITutor = async (req, res, next) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return next(new ErrorResponse('AI Tutor is not configured. Please add OPENAI_API_KEY to environment variables.', 503));
    }

    const {
      question,
      classroomId,
      context,
      sessionId,
      conversationHistory
    } = req.body;

    if (!question || question.trim().length === 0) {
      return next(new ErrorResponse('Question is required', 400));
    }

    if (question.length > 2000) {
      return next(new ErrorResponse('Question too long (max 2000 characters)', 400));
    }

    // Verify classroom access if provided
    if (classroomId) {
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
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add context if provided
    if (context) {
      let contextMessage = 'Context: ';
      if (context.subject) contextMessage += `Subject: ${context.subject}. `;
      if (context.topic) contextMessage += `Topic: ${context.topic}. `;
      if (context.difficulty) contextMessage += `Difficulty level: ${context.difficulty}.`;
      
      messages.push({ role: 'system', content: contextMessage });
    }

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question
    });

    // Call OpenAI API
    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.3
    });

    const responseTime = Date.now() - startTime;
    const aiResponse = completion.choices[0].message.content;

    // Save interaction to database
    const interaction = await AIInteraction.create({
      user: req.user.id,
      classroom: classroomId || null,
      question,
      aiResponse,
      context: context || {},
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage.total_tokens,
        responseTime,
        temperature: 0.7,
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000
      },
      conversationHistory: messages,
      sessionId: sessionId || null,
      isFollowUp: conversationHistory && conversationHistory.length > 0
    });

    res.status(200).json({
      success: true,
      data: {
        interactionId: interaction._id,
        question,
        response: aiResponse,
        metadata: {
          tokensUsed: completion.usage.total_tokens,
          responseTime,
          model: completion.model
        }
      }
    });
  } catch (error) {
    console.error('AI Tutor Error:', error);
    
    if (error.response?.status === 429) {
      return next(new ErrorResponse('AI service rate limit exceeded. Please try again later.', 429));
    }
    
    if (error.response?.status === 401) {
      return next(new ErrorResponse('AI service authentication failed', 500));
    }

    next(new ErrorResponse('Failed to get AI response', 500));
  }
};

// @desc    Get AI interaction history
// @route   GET /api/ai-tutor/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const {
      classroomId,
      sessionId,
      page = 1,
      limit = 20
    } = req.query;

    const query = { user: req.user.id };

    if (classroomId) query.classroom = classroomId;
    if (sessionId) query.sessionId = sessionId;

    const interactions = await AIInteraction.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-conversationHistory');

    const count = await AIInteraction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: interactions.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: interactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interaction details
// @route   GET /api/ai-tutor/:id
// @access  Private
exports.getInteraction = async (req, res, next) => {
  try {
    const interaction = await AIInteraction.findById(req.params.id)
      .populate('classroom', 'title subject');

    if (!interaction) {
      return next(new ErrorResponse('Interaction not found', 404));
    }

    // Check ownership
    if (interaction.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    res.status(200).json({
      success: true,
      data: interaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for AI response
// @route   POST /api/ai-tutor/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, helpful, comment } = req.body;

    const interaction = await AIInteraction.findById(req.params.id);

    if (!interaction) {
      return next(new ErrorResponse('Interaction not found', 404));
    }

    // Check ownership
    if (interaction.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return next(new ErrorResponse('Rating must be between 1 and 5', 400));
    }

    interaction.feedback = {
      rating,
      helpful,
      comment,
      submittedAt: Date.now()
    };

    await interaction.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: interaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI tutor statistics
// @route   GET /api/ai-tutor/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const stats = await AIInteraction.getUserStats(req.user.id);

    // Get popular topics
    const popularTopics = await AIInteraction.getPopularTopics(5);

    res.status(200).json({
      success: true,
      data: {
        userStats: stats,
        popularTopics
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate quiz questions using AI
// @route   POST /api/ai-tutor/generate-quiz
// @access  Private (Educator/Admin)
exports.generateQuizQuestions = async (req, res, next) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return next(new ErrorResponse('AI Tutor is not configured. Please add OPENAI_API_KEY to environment variables.', 503));
    }

    const {
      topic,
      subject,
      difficulty,
      questionCount = 5,
      questionType = 'multiple-choice'
    } = req.body;

    if (!topic || !subject) {
      return next(new ErrorResponse('Topic and subject are required', 400));
    }

    const prompt = `Generate ${questionCount} ${difficulty || 'medium'} difficulty ${questionType} questions about "${topic}" in the subject of ${subject}.

For each question, provide:
1. The question text
2. Four options (A, B, C, D) for multiple-choice
3. The correct answer
4. A brief explanation

Format the response as a JSON array of question objects with fields: question, options (array), correctAnswer, explanation, points (1-5 based on difficulty).`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator creating assessment questions. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const generatedQuestions = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      success: true,
      message: 'Quiz questions generated successfully',
      data: {
        questions: generatedQuestions.questions || generatedQuestions,
        metadata: {
          topic,
          subject,
          difficulty,
          tokensUsed: completion.usage.total_tokens
        }
      }
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    next(new ErrorResponse('Failed to generate quiz questions', 500));
  }
};

// @desc    Get AI-powered study suggestions
// @route   POST /api/ai-tutor/study-suggestions
// @access  Private
exports.getStudySuggestions = async (req, res, next) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return next(new ErrorResponse('AI Tutor is not configured. Please add OPENAI_API_KEY to environment variables.', 503));
    }

    const { subjects, weakAreas, goals } = req.body;

    const prompt = `Based on the following student profile, provide personalized study suggestions:
- Subjects: ${subjects?.join(', ') || 'Not specified'}
- Weak areas: ${weakAreas?.join(', ') || 'Not specified'}
- Goals: ${goals || 'General improvement'}

Provide:
1. 5 specific study recommendations
2. Suggested resources or topics to focus on
3. A recommended study schedule
4. Motivational tips

Keep it concise and actionable.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const suggestions = completion.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Study suggestions error:', error);
    next(new ErrorResponse('Failed to generate study suggestions', 500));
  }
};

module.exports = exports;
