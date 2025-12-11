/**
 * Web Browser Notification Service for Admin Panel
 * Handles desktop notifications, sound alerts, and permission management
 */

class WebNotificationService {
  constructor() {
    this.permission = 'default';
    this.audioContext = null;
    this.alertSound = null;
    this.enabled = false;
  }

  /**
   * Initialize notification service and request permissions
   */
  async initialize() {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return false;
      }

      // Check current permission
      this.permission = Notification.permission;

      if (this.permission === 'granted') {
        this.enabled = true;
        console.log('✅ Web notifications enabled');
        return true;
      }

      if (this.permission === 'default') {
        // Request permission
        const permission = await Notification.requestPermission();
        this.permission = permission;
        this.enabled = permission === 'granted';
        
        if (this.enabled) {
          console.log('✅ Web notifications permission granted');
        } else {
          console.warn('❌ Web notifications permission denied');
        }
        
        return this.enabled;
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize web notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      this.enabled = permission === 'granted';
      return this.enabled;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Show desktop notification
   */
  showNotification(title, options = {}) {
    if (!this.enabled) {
      console.warn('Notifications not enabled');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true, // Notification stays until dismissed
        ...options,
      });

      // Auto close after 30 seconds if not dismissed
      setTimeout(() => notification.close(), 30000);

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  /**
   * Show new order notification
   */
  showNewOrderNotification(order) {
    const notification = this.showNotification(
      '🔔 New Order Received!',
      {
        body: `Order #${order.orderNumber}\n${order.customer.name}\n₹${order.pricing.finalAmount.toFixed(2)}`,
        icon: '/logo192.png',
        tag: `order-${order._id}`, // Prevents duplicate notifications
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          type: 'NEW_ORDER',
        },
      }
    );

    // Play sound alert
    this.playAlertSound();

    // Handle notification click
    if (notification) {
      notification.onclick = () => {
        window.focus();
        // Navigate to order details
        window.location.href = `/admin/orders/${order._id}`;
        notification.close();
      };
    }

    return notification;
  }

  /**
   * Show order status update notification
   */
  showOrderStatusNotification(order, newStatus) {
    const statusMessages = {
      confirmed: '✅ Order Confirmed',
      preparing: '👨‍🍳 Order Being Prepared',
      ready: '🎉 Order Ready',
      picked_up: '🚚 Out for Delivery',
      delivered: '✅ Order Delivered',
      cancelled: '❌ Order Cancelled',
    };

    return this.showNotification(
      statusMessages[newStatus] || 'Order Status Updated',
      {
        body: `Order #${order.orderNumber}\n${order.customer.name}`,
        icon: '/logo192.png',
        tag: `order-status-${order._id}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          type: 'ORDER_STATUS_UPDATE',
          status: newStatus,
        },
      }
    );
  }

  /**
   * Play alert sound for new orders
   */
  playAlertSound(loops = 3) {
    try {
      // Create audio element
      const audio = new Audio('/sounds/order-alert.mp3');
      audio.volume = 1.0; // Max volume
      
      let playCount = 0;
      
      audio.addEventListener('ended', () => {
        playCount++;
        if (playCount < loops) {
          audio.currentTime = 0;
          audio.play();
        }
      });

      audio.play().catch(err => {
        console.warn('Failed to play alert sound:', err);
      });

      return audio;
    } catch (error) {
      console.error('Failed to create alert sound:', error);
      return null;
    }
  }

  /**
   * Create default beep sound if custom sound not available
   */
  playBeepSound() {
    try {
      // Create AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator for beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure beep
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      return true;
    } catch (error) {
      console.error('Failed to play beep sound:', error);
      return false;
    }
  }

  /**
   * Test notification
   */
  async testNotification() {
    if (!this.enabled) {
      const granted = await this.requestPermission();
      if (!granted) {
        alert('Please enable notifications to receive order alerts');
        return false;
      }
    }

    this.showNotification('🔔 Test Notification', {
      body: 'Notifications are working! You will receive alerts for new orders.',
      icon: '/logo192.png',
    });

    this.playBeepSound();
    return true;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get current permission status
   */
  getPermission() {
    return Notification.permission;
  }
}

// Export singleton instance
export default new WebNotificationService();
