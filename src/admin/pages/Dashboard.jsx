import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAdminStats } from '../hooks/useSocket';
import { ordersAPI, usersAPI, menuAPI } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import StatusBadge from '../components/ui/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });

  const { data: orderStatsResponse, loading: ordersLoading, error: ordersError } = useApi(ordersAPI.getStats, {});
  const { data: userStatsResponse, loading: usersLoading } = useApi(usersAPI.getStats, {});
  const { data: recentOrdersData, loading: recentLoading } = useApi(() => ordersAPI.getAll({ limit: 5, sort: '-createdAt' }), []);
  const { data: popularItemsData, loading: popularLoading } = useApi(() => menuAPI.getPopular({ limit: 5 }), []);

  const recentOrders = recentOrdersData?.orders || [];
  const popularItems = popularItemsData?.menuItems || [];

  useEffect(() => {
    if (orderStatsResponse) {
      const overview = orderStatsResponse.overview || {};
      const statusStats = orderStatsResponse.statusStats || [];
      
      // Find pending orders count from statusStats
      const pendingStatus = statusStats.find(s => s._id === 'PENDING');
      
      setStats(prev => ({
        ...prev,
        totalOrders: overview.totalOrders || 0,
        totalRevenue: overview.totalRevenue || 0,
        pendingOrders: pendingStatus?.count || 0,
      }));
    }
  }, [orderStatsResponse]);

  useEffect(() => {
    if (userStatsResponse) {
      // Find customer role stats
      const roleStats = userStatsResponse.roleStats || [];
      const customerStats = roleStats.find(s => s._id === 'customer');
      
      setStats(prev => ({
        ...prev,
        totalCustomers: customerStats?.count || 0,
      }));
    }
  }, [userStatsResponse]);

  useAdminStats((liveStats) => {
    if (liveStats) {
      setStats(prev => ({ ...prev, ...liveStats }));
    }
  });

  const loading = ordersLoading || usersLoading;

  if (ordersError) {
    return <ErrorMessage message={ordersError} className="m-6" />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {loading ? (
        <LoadingSpinner size="lg" className="my-12" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">All time orders</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">Total revenue</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">Registered users</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">Needs attention</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              {recentLoading ? (
                <LoadingSpinner size="sm" />
              ) : recentOrders.length === 0 ? (
                <p className="text-gray-500 text-sm">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-600">{order.items?.length || 0} items • {order.customer?.name || 'Customer'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{(order.pricing?.finalAmount || 0).toFixed(2)}</p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Menu Items</h2>
              {popularLoading ? (
                <LoadingSpinner size="sm" />
              ) : popularItems.length === 0 ? (
                <p className="text-gray-500 text-sm">No menu items yet</p>
              ) : (
                <div className="space-y-4">
                  {popularItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{item.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.stats?.orderCount || 0} sold</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">₹{(item.price || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
