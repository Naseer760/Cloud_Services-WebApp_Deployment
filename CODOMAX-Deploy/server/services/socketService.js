let ioInstance = null;

const initSocketService = (io) => {
  ioInstance = io;
};

const getIO = () => {
  return ioInstance;
};

const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId.toString()}`).emit(event, data);
  }
};

const emitToAdmin = (event, data) => {
  if (ioInstance) {
    ioInstance.to('admin_room').emit(event, data);
  }
};

const emitBroadcast = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};

module.exports = {
  initSocketService,
  getIO,
  emitToUser,
  emitToAdmin,
  emitBroadcast,
};
