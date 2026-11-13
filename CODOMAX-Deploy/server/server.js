require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocketService } = require('./services/socketService');
const setupSocketHandler = require('./sockets/socketHandler');

const User = require('./models/User');
const { seedData } = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Auto-seed demo records if database is empty (e.g. MemoryServer or fresh DB)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AutoSeed] Empty database detected. Populating demo accounts and records...');
      await seedData(false);
    }

    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.CLIENT_URL].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize Socket Service for broadcasting from controllers
    initSocketService(io);

    // Setup Socket connection handlers and rooms
    setupSocketHandler(io);

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Campus Lost & Found Server running on port ${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
      console.log(`⚡ Live Alerts Socket.IO listening on port ${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
