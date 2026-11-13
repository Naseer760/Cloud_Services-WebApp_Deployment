import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveAlert, setLiveAlert] = useState(null);

  // Fetch initial unread count on login
  useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getNotifications()
        .then((res) => {
          if (res.data.success) {
            setUnreadCount(res.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket.IO Connected successfully.');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚠️ Socket.IO Disconnected.');
      setIsConnected(false);
    });

    // Listen for new in-app notifications
    newSocket.on('new_notification', (data) => {
      setUnreadCount((prev) => prev + 1);
      setLiveAlert({
        title: data.notification?.title || 'New Live Notification',
        message: data.notification?.message || 'You received a new campus alert.',
        type: data.notification?.type || 'MATCH_SUGGESTION',
        score: data.score,
        itemId: data.notification?.relatedItemId,
        timestamp: new Date(),
      });
    });

    // Listen for high-priority match alerts
    newSocket.on('item_match_alert', (data) => {
      setLiveAlert({
        title: `🔥 High Probability Match Alert (${data.score}%)`,
        message: `Counterpart: "${data.counterpartItem?.title}". Click to inspect matching details.`,
        type: 'MATCH_SUGGESTION',
        score: data.score,
        itemId: data.counterpartItem?._id,
        timestamp: new Date(),
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token]);

  const clearLiveAlert = () => setLiveAlert(null);

  const decrementUnread = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const resetUnread = () => {
    setUnreadCount(0);
  };

  const value = {
    socket,
    isConnected,
    unreadCount,
    setUnreadCount,
    decrementUnread,
    resetUnread,
    liveAlert,
    clearLiveAlert,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
