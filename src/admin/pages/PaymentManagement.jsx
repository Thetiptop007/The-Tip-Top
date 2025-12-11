import { useState, useEffect } from 'react';
import Pagination from '../components/ui/Pagination';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function PaymentManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    onlinePayments: 0,
    codPayments: 0,
    todayRevenue: 0,
    todayOnline: 0,
    todayCOD: 0,
  });

  // Fetch orders and calculate payment stats
  useEffect(() => {
    fetchPayments();
  }, [currentPage, filterStatus, filterMethod]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Build query parameters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: '-createdAt',
      };

      // Add filters
      if (filterStatus !== 'ALL') {
        params.paymentStatus = filterStatus;
      }
      if (filterMethod !== 'ALL') {
        params.paymentMethod = filterMethod;
      }

      const response = await axios.get(`${API_URL}/orders`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ordersData = response.data.data.orders;
      setOrders(ordersData);
      setTotalPages(response.data.pagination.totalPages || 1);
      setTotalItems(response.data.pagination.totalItems || 0);

      // Fetch payment stats
      await fetchPaymentStats();
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Failed to fetch payments. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      console.log('🔍 Fetching payment stats...');
      
      const response = await axios.get(`${API_URL}/orders/stats/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📊 Payment stats API response:', response.data);

      const { overview, paymentMethodStats } = response.data.data;

      // Calculate totals
      const totalRevenue = overview.totalRevenue || 0;
      const online = paymentMethodStats.find(p => p._id === 'ONLINE')?.totalAmount || 0;
      const cod = paymentMethodStats.find(p => p._id === 'COD')?.totalAmount || 0;

      // Get today's data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrdersResponse = await axios.get(`${API_URL}/orders`, {
        params: {
          'createdAt[gte]': today.toISOString(),
          limit: 100,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const todayOrders = todayOrdersResponse.data.data.orders || [];
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.pricing.finalAmount, 0);
      const todayOnline = todayOrders
        .filter(o => o.paymentMethod === 'ONLINE')
        .reduce((sum, order) => sum + order.pricing.finalAmount, 0);
      const todayCOD = todayOrders
        .filter(o => o.paymentMethod === 'COD')
        .reduce((sum, order) => sum + order.pricing.finalAmount, 0);

      const calculatedStats = {
        totalRevenue,
        onlinePayments: online,
        codPayments: cod,
        todayRevenue,
        todayOnline,
        todayCOD,
      };

      console.log('✅ Calculated payment stats:', calculatedStats);
      
      setPaymentStats(calculatedStats);
    } catch (error) {
      console.error('❌ Error fetching payment stats:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  // Convert orders to payment format for display
  const payments = orders.map(order => ({
    id: order._id,
    transactionId: order.paymentDetails?.transactionId || 'N/A',
    orderId: order.orderNumber,
    customerName: order.customer.name,
    customerEmail: order.customer.email || 'N/A',
    amount: order.pricing.finalAmount,
    paymentMethod: order.paymentMethod,
    paymentProvider: order.paymentDetails?.gateway || (order.paymentMethod === 'COD' ? 'Cash' : 'N/A'),
    status: order.paymentStatus,
    date: new Date(order.createdAt),
    refundable: order.paymentStatus === 'PAID' && order.status !== 'DELIVERED',
    orderDetails: order,
  }));

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleRefund = async (payment) => {
    if (!window.confirm(`Process refund of ₹${payment.amount} for order ${payment.orderId}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/orders/${payment.id}/status`,
        {
          status: payment.orderDetails.status,
          paymentStatus: 'REFUNDED',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Refund processed successfully!');
      setShowDetailsModal(false);
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund. Please try again.');
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 60000);
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) {
      const hours = Math.floor(diff / 60);
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diff / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'SUCCESS': return 'bg-green-100 text-green-700'; // For backward compatibility
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'REFUNDED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMethodIcon = (method) => {
    switch(method) {
      case 'ONLINE': return '💳';
      case 'COD': return '💵';
      default: return '💰';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
        </div>
        <button
          onClick={fetchPayments}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{paymentStats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">All time revenue</p>
        </div>

        {/* Total Online */}
        <div className="bg-white rounded-lg shadow-md border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Online Payments (Total)</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">₹{paymentStats.onlinePayments.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{((paymentStats.onlinePayments / paymentStats.totalRevenue) * 100).toFixed(1)}% of total</p>
        </div>

        {/* Total COD */}
        <div className="bg-white rounded-lg shadow-md border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">COD Payments (Total)</span>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">₹{paymentStats.codPayments.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{((paymentStats.codPayments / paymentStats.totalRevenue) * 100).toFixed(1)}% of total</p>
        </div>

        {/* Today's Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-700 text-sm font-medium">Today's Revenue</span>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-700">₹{paymentStats.todayRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1 font-medium">Today's total</p>
        </div>

        {/* Today's Online */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 text-sm font-medium">Online (Today)</span>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-700">₹{paymentStats.todayOnline.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">{((paymentStats.todayOnline / paymentStats.todayRevenue) * 100).toFixed(1)}% of today</p>
        </div>

        {/* Today's COD */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-700 text-sm font-medium">COD (Today)</span>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-700">₹{paymentStats.todayCOD.toLocaleString()}</p>
          <p className="text-xs text-orange-600 mt-1">{((paymentStats.todayCOD / paymentStats.todayRevenue) * 100).toFixed(1)}% of today</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Method</label>
            <select
              value={filterMethod}
              onChange={(e) => {
                setFilterMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Methods</option>
              <option value="ONLINE">Online Payment</option>
              <option value="COD">Cash on Delivery</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Payment Transactions</h2>
            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : `Showing ${payments.length} of ${totalItems} transactions`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">No payment transactions match the selected filters.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-600">
                      {payment.transactionId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-red-600">
                      {payment.orderId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                      <div className="text-xs text-gray-500">{payment.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMethodIcon(payment.paymentMethod)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.paymentMethod}</div>
                        <div className="text-xs text-gray-500">{payment.paymentProvider}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatTime(payment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(payment)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {!loading && payments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Transaction ID:</span>
                  <span className="font-mono text-sm font-semibold">{selectedPayment.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Order ID:</span>
                  <span className="font-semibold text-red-600">{selectedPayment.orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Status:</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Amount:</span>
                  <span className="font-bold text-green-600 text-2xl">
                    ₹{selectedPayment.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Name:</span>
                    <span className="font-semibold">{selectedPayment.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Email:</span>
                    <span className="font-semibold">{selectedPayment.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getMethodIcon(selectedPayment.paymentMethod)}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedPayment.paymentMethod}</div>
                      <div className="text-sm text-gray-600">{selectedPayment.paymentProvider}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Time */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Time</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    {selectedPayment.date.toLocaleString('en-IN', { 
                      dateStyle: 'full', 
                      timeStyle: 'short' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatTime(selectedPayment.date)}</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Close
              </button>
              {selectedPayment.refundable && selectedPayment.status === 'SUCCESS' && (
                <button
                  onClick={() => handleRefund(selectedPayment)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                >
                  Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
