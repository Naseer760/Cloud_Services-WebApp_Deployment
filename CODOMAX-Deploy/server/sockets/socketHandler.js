const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const User = require('../models/User');

const setupSocketHandler = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // Allow unauthenticated connection for public broadcast alerts if desired,
        // but mark socket as guest
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user || !user.isActive) {
        return next(new Error('Authentication failed or user inactive'));
      }

      socket.user = user;
      next();
    } catch (err) {
      // Don't crash socket, attach guest
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      const userId = socket.user._id.toString();
      socket.join(`user_${userId}`);
      console.log(`[Socket] User connected: ${socket.user.name} (${socket.user.role}) - Room: user_${userId}`);

      if (socket.user.role === 'admin') {
        socket.join('admin_room');
        console.log(`[Socket] Admin joined admin_room: ${socket.user.name}`);
      }
    } else {
      console.log(`[Socket] Guest client connected: ${socket.id}`);
    }

    // Client can join a specific item room for real-time item comments/updates
    socket.on('join_item_room', (itemId) => {
      if (itemId) {
        socket.join(`item_${itemId}`);
      }
    });

    socket.on('leave_item_room', (itemId) => {
      if (itemId) {
        socket.leave(`item_${itemId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};

module.exports = setupSocketHandler;
