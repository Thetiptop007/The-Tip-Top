import { useState, useEffect } from 'react';
import socketService from '../api/socket';

/**
 * Hook to manage Socket.IO connection and events
 */
export const useSocket = (token) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (token) {
      const socket = socketService.connect(token);
      
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));

      return () => {
        socketService.disconnect();
      };
    }
  }, [token]);

  return { connected, socket: socketService.socket };
};

/**
 * Hook to listen to real-time order updates
 */
export const useOrderUpdates = (callback) => {
  useEffect(() => {
    socketService.onOrderUpdate(callback);
    return () => socketService.off('order:update', callback);
  }, [callback]);
};

/**
 * Hook to listen to real-time notifications
 */
export const useNotifications = (callback) => {
  useEffect(() => {
    socketService.onNotification(callback);
    return () => socketService.off('notification', callback);
  }, [callback]);
};

/**
 * Hook to listen to admin dashboard stats
 */
export const useAdminStats = (callback) => {
  useEffect(() => {
    socketService.joinAdminDashboard();
    socketService.onAdminStats(callback);
    
    return () => socketService.off('admin:stats', callback);
  }, [callback]);
};
