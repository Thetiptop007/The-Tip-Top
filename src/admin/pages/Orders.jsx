import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../components/ui/Pagination';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchOrders();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await axios.get(`${API_URL}/orders`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data.data.orders);
      setTotalPages(response.data.pagination.totalPages || 1);
      setTotalItems(response.data.pagination.totalItems || 0);
    } catch (error) {
      alert('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      console.log('🔍 Fetching order stats...');
      
      // Fetch overall stats
      const statsResponse = await axios.get(`${API_URL}/orders/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('📊 Stats API Response:', statsResponse.data);

      const overview = statsResponse.data.data?.overview || {};
      const statusStats = statsResponse.data.data?.statusStats || [];
      
      console.log('📈 Overview data:', overview);
      console.log('📈 Status stats:', statusStats);
      
      // For now, use total stats for both today and all-time
      // Since we can't easily fetch today's orders without proper backend filtering
      const pendingOrders = statusStats.find(s => s._id === 'PENDING')?.count || 0;
      
      const newStats = {
        todayOrders: pendingOrders, // Show pending orders as "today's" for now
        totalOrders: overview.totalOrders || 0,
        todayRevenue: 0, // Will be 0 until we can properly fetch today's orders
        totalRevenue: overview.totalRevenue || 0,
      };
      
      console.log('✅ Setting stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('❌ Error fetching order stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set default values on error
      setStats({
        todayOrders: 0,
        totalOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0,
      });
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/orders/${orderId}/ready`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Order marked as ready successfully!');
      fetchOrders();
      fetchOrderStats();
    } catch (error) {
      console.error('Error marking order ready:', error);
      alert(error.response?.data?.message || 'Failed to mark order as ready. Please try again.');
    }
  };

  const fetchAvailablePartners = async () => {
    try {
      setLoadingPartners(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.get(`${API_URL}/delivery/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAvailablePartners(response.data.data.partners || []);
    } catch (error) {
      console.error('Error fetching available partners:', error);
      alert('Failed to fetch available partners. Please try again.');
    } finally {
      setLoadingPartners(false);
    }
  };

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setSelectedPartnerId(null);
    setShowAssignModal(true);
    fetchAvailablePartners();
  };

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) {
      alert('Please select a delivery partner');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/orders/${selectedOrder._id}/assign`,
        { partnerId: selectedPartnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Delivery partner assigned successfully!');
      setShowAssignModal(false);
      setShowDetailsModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error assigning partner:', error);
      alert(error.response?.data?.message || 'Failed to assign delivery partner. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason || !reason.trim()) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/orders/${orderId}/admin-cancel`,
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Order cancelled successfully!');
      fetchOrders();
      fetchOrderStats();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.message || 'Failed to cancel order. Please try again.');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'READY':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'PENDING':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading...' : `Showing ${orders.length} of ${totalItems} orders`}
          </p>
        </div>
        <button 
          onClick={fetchOrders}
          disabled={loading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Loading...' : 'Refresh'}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Today's Orders</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Orders placed today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Orders</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">All time orders</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-700 text-sm font-medium">Today's Revenue</span>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-700">₹{stats.todayRevenue.toLocaleString()}</p>
          <p className="text-xs text-purple-600 mt-1 font-medium">Revenue today</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-700 text-sm font-medium">Total Revenue</span>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-700">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">All time revenue</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="READY">Ready</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">No orders match the selected filters.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-red-600">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-xs text-gray-500">{order.customer.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {order.items.length} items
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{order.pricing.finalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-600">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm px-2 py-1"
                      >
                        View
                      </button>
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleMarkReady(order._id)}
                            className="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                          >
                            Mark Ready
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'READY' && (
                        <>
                          <button
                            onClick={() => openAssignModal(order)}
                            className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                          >
                            Assign Partner
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-[100000] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between shadow-md">
              <div>
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <p className="text-red-100 text-sm mt-0.5">Complete order information</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              {/* Order Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-600 mb-1">Order Number</p>
                    <p className="text-lg font-bold text-red-700">{selectedOrder.orderNumber}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 uppercase">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-600 mb-1">Name</p>
                    <p className="text-base font-semibold text-gray-900">{selectedOrder.customer.name}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-600 mb-1">Phone</p>
                    <p className="text-base font-semibold text-gray-900">{selectedOrder.customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery Address
                </h3>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="space-y-2">
                    {selectedOrder.deliveryAddress?.apartment && (
                      <p className="text-base text-gray-900 font-medium">{selectedOrder.deliveryAddress.apartment}</p>
                    )}
                    {selectedOrder.deliveryAddress?.street && (
                      <p className="text-base text-gray-900">{selectedOrder.deliveryAddress.street}</p>
                    )}
                    {selectedOrder.deliveryAddress?.landmark && (
                      <p className="text-sm text-gray-700">📍 Near: {selectedOrder.deliveryAddress.landmark}</p>
                    )}
                    <p className="text-base text-gray-900">
                      {[
                        selectedOrder.deliveryAddress?.city,
                        selectedOrder.deliveryAddress?.state,
                        selectedOrder.deliveryAddress?.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {selectedOrder.deliveryAddress?.deliveryInstructions && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-green-700">📝 Instructions:</span> {selectedOrder.deliveryAddress.deliveryInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Partner (if assigned) */}
              {selectedOrder.deliveryPartner && (
                <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Delivery Partner
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs font-medium text-purple-600 mb-1">Name</p>
                        <p className="text-base font-semibold text-gray-900">{selectedOrder.deliveryPartner.name}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs font-medium text-purple-600 mb-1">Phone</p>
                        <p className="text-base font-semibold text-gray-900">{selectedOrder.deliveryPartner.phone}</p>
                      </div>
                      {selectedOrder.deliveryPartner.vehicleNumber && (
                        <div className="bg-white rounded-lg p-3 col-span-2">
                          <p className="text-xs font-medium text-purple-600 mb-1">Vehicle Number</p>
                          <p className="text-base font-semibold text-gray-900">{selectedOrder.deliveryPartner.vehicleNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Order Items ({selectedOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">×{item.quantity}</span>
                          <p className="font-semibold text-gray-900">
                            {item.name}
                            {(item.portion || item.variant || item.size) && (
                              <span className="ml-2 text-orange-600 font-medium">
                                ({item.portion || item.variant || item.size})
                              </span>
                            )}
                          </p>
                        </div>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="ml-7 space-y-1">
                            {item.customizations.map((custom, idx) => (
                              <p key={idx} className="text-sm text-gray-700">
                                ➕ <span className="font-medium">{custom.name}:</span> {custom.options?.join(', ') || 'N/A'}
                                {custom.additionalPrice > 0 && <span className="text-green-600 ml-1">(+₹{custom.additionalPrice})</span>}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <p className="text-sm text-gray-700 ml-7">
                            ➕ <span className="font-medium">Add-ons:</span> {item.selectedAddons.map(a => a.name).join(', ')}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-700 italic ml-7 mt-1 bg-yellow-100 border-l-2 border-yellow-400 pl-2 py-1">
                            💬 {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-red-600">₹{item.price.toFixed(2)}</p>
                        {item.subtotal && item.subtotal !== item.price && (
                          <p className="text-xs text-gray-500">Subtotal: ₹{item.subtotal.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Price Breakdown
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="text-gray-700 font-medium">Items Total</span>
                    <span className="font-semibold text-gray-900">₹{selectedOrder.pricing.itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="text-gray-700 font-medium">Delivery Fee</span>
                    <span className="font-semibold text-gray-900">₹{selectedOrder.pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="flex justify-between items-center bg-green-100 border border-green-300 rounded-lg p-3">
                      <span className="text-green-700 font-medium">💰 Discount</span>
                      <span className="font-semibold text-green-700">-₹{selectedOrder.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 mt-3">
                    <span className="text-xl font-bold text-white">Total Amount</span>
                    <span className="text-2xl font-bold text-white">₹{selectedOrder.pricing.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status History
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={index} className="flex justify-between items-start bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(history.status)}`}>
                              {getStatusLabel(history.status)}
                            </span>
                          </div>
                          {history.note && (
                            <p className="text-sm text-gray-700 ml-4 bg-white border-l-2 border-indigo-400 pl-3 py-1 rounded">{history.note}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-xs text-gray-500 block">
                            {new Date(history.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            {new Date(history.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end shadow-lg">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
              {selectedOrder.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      handleMarkReady(selectedOrder._id);
                      setShowDetailsModal(false);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark Ready
                  </button>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder._id);
                      setShowDetailsModal(false);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Order
                  </button>
                </>
              )}
              {selectedOrder.status === 'READY' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openAssignModal(selectedOrder);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Assign Partner
                  </button>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder._id);
                      setShowDetailsModal(false);
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Order
                  </button>
                </>
              )}
              {selectedOrder.status === 'OUT_FOR_DELIVERY' && (
                <button
                  onClick={() => {
                    handleCancelOrder(selectedOrder._id);
                    setShowDetailsModal(false);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Partner Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 backdrop-blur-sm bg-white/30"
            onClick={() => setShowAssignModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">Assign Delivery Partner</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {selectedOrder && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.orderNumber}</p>
                  <p className="text-sm text-gray-600 mt-2">Delivery Address</p>
                  <p className="text-sm text-gray-900">{selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}</p>
                </div>
              )}

              {loadingPartners ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : availablePartners.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No available delivery partners</p>
                  <p className="text-sm text-gray-500 mt-1">All partners are currently offline or busy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Available Partners ({availablePartners.length})
                  </p>
                  {availablePartners.map((partner) => (
                    <div
                      key={partner._id}
                      onClick={() => setSelectedPartnerId(partner._id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPartnerId === partner._id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{partner.name}</p>
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                              Online
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">📞 {partner.phone}</p>
                            <p className="text-sm text-gray-600">📧 {partner.email}</p>
                            {partner.vehicleType && (
                              <p className="text-sm text-gray-600">🏍️ {partner.vehicleType}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-sm text-gray-600">⭐ {partner.rating?.toFixed(1) || 'N/A'}</span>
                              <span className="text-sm text-gray-600">📦 {partner.totalDeliveries || 0} deliveries</span>
                            </div>
                          </div>
                        </div>
                        {selectedPartnerId === partner._id && (
                          <div className="ml-3">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPartner}
                disabled={!selectedPartnerId || loadingPartners}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Assign Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
