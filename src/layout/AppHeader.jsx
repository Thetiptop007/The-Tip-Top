import { useState } from 'react';
import { useSidebar } from "../context/SidebarContext";
import { Link, useNavigate } from "react-router-dom";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD-001 from John Doe',
      time: '2 mins ago',
      unread: true,
      icon: '🛒'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: '₹607 received for Order #ORD-001',
      time: '5 mins ago',
      unread: true,
      icon: '💳'
    },
    {
      id: 3,
      type: 'order',
      title: 'Order Ready',
      message: 'Order #ORD-002 is ready for delivery',
      time: '12 mins ago',
      unread: false,
      icon: '✅'
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Delivered',
      message: 'Order #ORD-003 successfully delivered',
      time: '25 mins ago',
      unread: false,
      icon: '🚚'
    },
    {
      id: 5,
      type: 'payment',
      title: 'Payment Received',
      message: '₹303 received for Order #ORD-002',
      time: '30 mins ago',
      unread: false,
      icon: '💰'
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-50';
      case 'payment': return 'bg-green-50';
      default: return 'bg-stone-100';
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-stone-200 z-40">
      <div className="flex items-center justify-between w-full px-4 py-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-stone-200 rounded-lg hover:bg-stone-100"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link to="/" className="lg:hidden">
            <div className="w-10 h-10 bg-red-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-stone-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Menu */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-stone-200 z-50 max-h-[500px] overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-400 text-white px-2 py-1 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto max-h-[400px]">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationBgColor(notification.type)} flex items-center justify-center text-xl`}>
                            {notification.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              {notification.unread && (
                                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 ml-2 mt-1"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 py-3 bg-stone-50 border-t border-stone-200">
                    <button className="w-full text-center text-sm font-medium text-red-400 hover:text-red-500">
                      View All Notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-stone-200 relative">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900 poppins-medium">Admin User</p>
              <p className="text-xs text-gray-500 poppins-regular">Restaurant Manager</p>
            </div>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-red-400 text-white font-semibold flex items-center justify-center hover:bg-red-500 transition-colors"
            >
              A
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-xl border border-stone-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-200">
                    <p className="text-sm font-medium text-gray-900 poppins-medium">Admin User</p>
                    <p className="text-xs text-gray-500 poppins-regular truncate">
                      {localStorage.getItem('adminEmail') || 'admin@thetiptop.com'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors poppins-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
