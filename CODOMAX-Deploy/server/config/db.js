
const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (process.env.NODE_ENV === 'production' && !uri) {
    throw new Error('MONGODB_URI must be configured in production.');
  }

  const connectionUri =
    uri || 'mongodb://127.0.0.1:27017/campus_lost_found';

  try {
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      `[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );

    return conn;
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed: ${err.message}`);

    // Never use temporary in-memory storage in production.
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }

    console.log('[Database] Starting local MongoDB Memory Server...');

    const { MongoMemoryServer } = require('mongodb-memory-server');

    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'campus_lost_found',
      },
    });

    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);

    console.log('[Database] Local Memory Server connected.');

    return conn;
  }
};

const closeDB = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDB, closeDB };
