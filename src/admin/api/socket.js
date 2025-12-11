import { io } from 'socket.io-client';
import webNotificationService from '../services/notification.service';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Admin-specific methods
  joinAdminDashboard() {
    if (this.socket?.connected) {
      this.socket.emit('admin:request-stats');
    }
  }

  onOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('order:update', callback);
    }
  }

  onNewOrder(callback) {
    if (this.socket) {
      this.socket.on('order:new', (order) => {
        console.log('📦 New order received:', order);
        
        // Show web notification
        if (webNotificationService.isEnabled()) {
          webNotificationService.showNewOrderNotification(order);
        }
        
        // Call the callback
        if (callback) callback(order);
      });
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  onAdminStats(callback) {
    if (this.socket) {
      this.socket.on('admin:stats', callback);
    }
  }

  // Cleanup listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
