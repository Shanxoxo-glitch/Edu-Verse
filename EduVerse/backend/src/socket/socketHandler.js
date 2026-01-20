const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store active users and their socket connections
const activeUsers = new Map();
const classroomSessions = new Map();

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Initialize Socket.IO handlers
const initializeSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

    // Store active user
    activeUsers.set(socket.user.id.toString(), {
      socketId: socket.id,
      user: socket.user,
      connectedAt: Date.now()
    });

    // Emit online users count
    io.emit('users:online', { count: activeUsers.size });

    // Join user to their personal room
    socket.join(`user:${socket.user.id}`);

    // ==================== CLASSROOM EVENTS ====================

    // Join classroom
    socket.on('classroom:join', async (data) => {
      try {
        const { classroomId, avatarPosition } = data;

        // Join classroom room
        socket.join(`classroom:${classroomId}`);

        // Track classroom session
        if (!classroomSessions.has(classroomId)) {
          classroomSessions.set(classroomId, new Map());
        }

        const classroomUsers = classroomSessions.get(classroomId);
        classroomUsers.set(socket.user.id.toString(), {
          socketId: socket.id,
          user: {
            id: socket.user.id,
            name: socket.user.name,
            avatarData: socket.user.avatarData
          },
          position: avatarPosition || { x: 0, y: 0, z: 0 },
          joinedAt: Date.now()
        });

        // Notify others in classroom
        socket.to(`classroom:${classroomId}`).emit('classroom:user-joined', {
          user: {
            id: socket.user.id,
            name: socket.user.name,
            avatarData: socket.user.avatarData
          },
          position: avatarPosition
        });

        // Send current users in classroom to the new joiner
        const usersInClassroom = Array.from(classroomUsers.values()).map(u => ({
          user: u.user,
          position: u.position
        }));

        socket.emit('classroom:users-list', { users: usersInClassroom });

        console.log(`User ${socket.user.name} joined classroom ${classroomId}`);
      } catch (error) {
        console.error('Classroom join error:', error);
        socket.emit('error', { message: 'Failed to join classroom' });
      }
    });

    // Leave classroom
    socket.on('classroom:leave', (data) => {
      const { classroomId } = data;

      socket.leave(`classroom:${classroomId}`);

      if (classroomSessions.has(classroomId)) {
        const classroomUsers = classroomSessions.get(classroomId);
        classroomUsers.delete(socket.user.id.toString());

        // Notify others
        socket.to(`classroom:${classroomId}`).emit('classroom:user-left', {
          userId: socket.user.id
        });
      }

      console.log(`User ${socket.user.name} left classroom ${classroomId}`);
    });

    // Avatar movement update
    socket.on('avatar:move', (data) => {
      const { classroomId, position, rotation } = data;

      // Update position in session
      if (classroomSessions.has(classroomId)) {
        const classroomUsers = classroomSessions.get(classroomId);
        const userSession = classroomUsers.get(socket.user.id.toString());
        
        if (userSession) {
          userSession.position = position;
          userSession.rotation = rotation;
        }
      }

      // Broadcast to others in classroom
      socket.to(`classroom:${classroomId}`).emit('avatar:moved', {
        userId: socket.user.id,
        position,
        rotation
      });
    });

    // Avatar action (wave, jump, etc.)
    socket.on('avatar:action', (data) => {
      const { classroomId, action } = data;

      socket.to(`classroom:${classroomId}`).emit('avatar:action', {
        userId: socket.user.id,
        action
      });
    });

    // ==================== CHAT EVENTS ====================

    // Send chat message
    socket.on('chat:message', (data) => {
      const { classroomId, message, type = 'text' } = data;

      const chatMessage = {
        id: `msg_${Date.now()}_${socket.id}`,
        user: {
          id: socket.user.id,
          name: socket.user.name,
          avatarData: socket.user.avatarData
        },
        message,
        type,
        timestamp: Date.now()
      };

      // Broadcast to classroom
      io.to(`classroom:${classroomId}`).emit('chat:message', chatMessage);
    });

    // Typing indicator
    socket.on('chat:typing', (data) => {
      const { classroomId, isTyping } = data;

      socket.to(`classroom:${classroomId}`).emit('chat:typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping
      });
    });

    // ==================== QUIZ EVENTS ====================

    // Start quiz session
    socket.on('quiz:start', (data) => {
      const { classroomId, quizId } = data;

      io.to(`classroom:${classroomId}`).emit('quiz:started', {
        quizId,
        startedBy: socket.user.name,
        timestamp: Date.now()
      });
    });

    // Quiz progress update
    socket.on('quiz:progress', (data) => {
      const { classroomId, quizId, progress } = data;

      // Notify educator
      socket.to(`classroom:${classroomId}`).emit('quiz:user-progress', {
        userId: socket.user.id,
        userName: socket.user.name,
        quizId,
        progress
      });
    });

    // ==================== PRESENTATION EVENTS ====================

    // Start presentation
    socket.on('presentation:start', (data) => {
      const { classroomId, materialId } = data;

      socket.to(`classroom:${classroomId}`).emit('presentation:started', {
        materialId,
        presentedBy: socket.user.name,
        timestamp: Date.now()
      });
    });

    // Sync presentation slide
    socket.on('presentation:slide-change', (data) => {
      const { classroomId, slideIndex } = data;

      socket.to(`classroom:${classroomId}`).emit('presentation:slide-changed', {
        slideIndex,
        changedBy: socket.user.id
      });
    });

    // ==================== VOICE/VIDEO EVENTS ====================

    // WebRTC signaling for voice chat
    socket.on('voice:offer', (data) => {
      const { classroomId, targetUserId, offer } = data;

      io.to(`user:${targetUserId}`).emit('voice:offer', {
        fromUserId: socket.user.id,
        fromUserName: socket.user.name,
        offer
      });
    });

    socket.on('voice:answer', (data) => {
      const { targetUserId, answer } = data;

      io.to(`user:${targetUserId}`).emit('voice:answer', {
        fromUserId: socket.user.id,
        answer
      });
    });

    socket.on('voice:ice-candidate', (data) => {
      const { targetUserId, candidate } = data;

      io.to(`user:${targetUserId}`).emit('voice:ice-candidate', {
        fromUserId: socket.user.id,
        candidate
      });
    });

    // Mute/unmute status
    socket.on('voice:mute-status', (data) => {
      const { classroomId, isMuted } = data;

      socket.to(`classroom:${classroomId}`).emit('voice:user-mute-status', {
        userId: socket.user.id,
        isMuted
      });
    });

    // ==================== NOTIFICATION EVENTS ====================

    // Send notification to specific user
    socket.on('notification:send', (data) => {
      const { targetUserId, notification } = data;

      io.to(`user:${targetUserId}`).emit('notification:received', {
        ...notification,
        from: socket.user.name,
        timestamp: Date.now()
      });
    });

    // ==================== HAND RAISE EVENT ====================

    socket.on('classroom:hand-raise', (data) => {
      const { classroomId, isRaised } = data;

      io.to(`classroom:${classroomId}`).emit('classroom:hand-raised', {
        userId: socket.user.id,
        userName: socket.user.name,
        isRaised,
        timestamp: Date.now()
      });
    });

    // ==================== DISCONNECT ====================

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.id})`);

      // Remove from active users
      activeUsers.delete(socket.user.id.toString());

      // Remove from all classroom sessions
      classroomSessions.forEach((classroomUsers, classroomId) => {
        if (classroomUsers.has(socket.user.id.toString())) {
          classroomUsers.delete(socket.user.id.toString());

          // Notify others in classroom
          io.to(`classroom:${classroomId}`).emit('classroom:user-left', {
            userId: socket.user.id
          });
        }
      });

      // Emit updated online count
      io.emit('users:online', { count: activeUsers.size });
    });

    // ==================== ERROR HANDLING ====================

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An error occurred' });
    });
  });

  // Periodic cleanup of empty classroom sessions
  setInterval(() => {
    classroomSessions.forEach((users, classroomId) => {
      if (users.size === 0) {
        classroomSessions.delete(classroomId);
      }
    });
  }, 300000); // Every 5 minutes

  return io;
};

// Helper function to emit to specific user
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to classroom
const emitToClassroom = (io, classroomId, event, data) => {
  io.to(`classroom:${classroomId}`).emit(event, data);
};

// Get active users in a classroom
const getClassroomUsers = (classroomId) => {
  const users = classroomSessions.get(classroomId);
  return users ? Array.from(users.values()) : [];
};

// Get total online users
const getOnlineUsersCount = () => {
  return activeUsers.size;
};

module.exports = {
  initializeSocketHandlers,
  emitToUser,
  emitToClassroom,
  getClassroomUsers,
  getOnlineUsersCount
};
