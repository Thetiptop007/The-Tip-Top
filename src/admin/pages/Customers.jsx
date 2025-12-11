import { useState, useEffect } from 'react';
import Pagination from '../components/ui/Pagination';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, selectedFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchCustomers();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        role: 'customer',
        sort: '-createdAt',
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedFilter !== 'All') {
        if (selectedFilter === 'Active') {
          params.isActive = true;
          params.isBlocked = false;
        } else if (selectedFilter === 'Inactive') {
          params.isActive = false;
        } else if (selectedFilter === 'VIP') {
          params['customerData.isVIP'] = true;
        }
      }

      const [usersResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/users`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/users/stats/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = usersResponse.data.data.users;
      console.log('📊 Customers Data:', usersData);
      if (usersData.length > 0) {
        console.log('📝 First Customer Structure:', usersData[0]);
      }
      setCustomers(usersData);
      setTotalPages(usersResponse.data.pagination.totalPages || 1);
      setTotalItems(usersResponse.data.pagination.totalItems || 0);

      // Update stats
      const customerStatsData = statsResponse.data.data.customerStats;
      setStats({
        total: customerStatsData.totalCustomers || 0,
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [dummyCustomers] = useState([
    {
      id: 1,
      name: 'Marie Dupont',
      email: 'marie.d@example.com',
      phone: '+33 6 12 34 56 78',
      totalOrders: 24,
      totalSpent: 1248.50,
      lastOrder: '2024-12-05',
      status: 'Active',
      joinedDate: '2024-01-15',
      avgOrderValue: 52.02
    },
    {
      id: 2,
      name: 'Jean Martin',
      email: 'jean.m@example.com',
      phone: '+33 6 23 45 67 89',
      totalOrders: 18,
      totalSpent: 892.30,
      lastOrder: '2024-12-04',
      status: 'Active',
      joinedDate: '2024-02-20',
      avgOrderValue: 49.57
    },
    {
      id: 3,
      name: 'Sophie Bernard',
      email: 'sophie.b@example.com',
      phone: '+33 6 34 56 78 90',
      totalOrders: 32,
      totalSpent: 1654.80,
      lastOrder: '2024-12-03',
      status: 'VIP',
      joinedDate: '2023-11-10',
      avgOrderValue: 51.71
    },
    {
      id: 4,
      name: 'Pierre Leroy',
      email: 'pierre.l@example.com',
      phone: '+33 6 45 67 89 01',
      totalOrders: 5,
      totalSpent: 245.20,
      lastOrder: '2024-11-28',
      status: 'Inactive',
      joinedDate: '2024-06-12',
      avgOrderValue: 49.04
    },
  ]);

  // Transform backend data to match UI format
  const transformedCustomers = customers.map(user => {
    // Handle both nested and flat data structures
    const name = typeof user.name === 'string' 
      ? user.name 
      : `${user.name?.first || ''} ${user.name?.last || ''}`.trim() || 'N/A';
    
    const email = typeof user.email === 'string'
      ? user.email
      : user.email?.address || 'N/A';
    
    const phone = typeof user.phone === 'string'
      ? user.phone
      : user.phone?.number || 'N/A';

    return {
      id: user._id,
      name,
      email,
      phone,
      totalOrders: user.customerData?.totalOrders || 0,
      totalSpent: user.customerData?.totalSpent || 0,
      lastOrder: user.customerData?.lastOrderDate ? new Date(user.customerData.lastOrderDate).toISOString().split('T')[0] : 'N/A',
      status: user.customerData?.isVIP ? 'VIP' : (user.isActive && !user.isBlocked ? 'Active' : 'Inactive'),
      joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
      avgOrderValue: user.customerData?.totalOrders > 0 ? (user.customerData.totalSpent / user.customerData.totalOrders) : 0,
      isBlocked: user.isBlocked,
      userData: user,
    };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'VIP':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleBlockUnblock = async (customer) => {
    const action = customer.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} ${customer.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${API_URL}/users/${customer.id}`,
        { isBlocked: !customer.isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Customer ${action}ed successfully!`);
      fetchCustomers();
    } catch (error) {
      console.error(`Error ${action}ing customer:`, error);
      alert(`Failed to ${action} customer. Please try again.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <button 
          onClick={fetchCustomers}
          disabled={loading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Customers</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Active', 'VIP', 'Inactive'].map(filter => (
              <button
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  selectedFilter === filter
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : transformedCustomers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">No customers match the selected filters.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transformedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">Joined {customer.joinedDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-xs text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{customer.totalOrders}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">₹{(customer.totalSpent || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">₹{(customer.avgOrderValue || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ₹{getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => viewCustomerDetails(customer)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleBlockUnblock(customer)}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          customer.isBlocked
                            ? 'text-white bg-green-500 hover:bg-green-600 focus:ring-green-400'
                            : 'text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-400'
                        }`}
                      >
                        {customer.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {!loading && transformedCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mt-2 ₹{getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="font-semibold text-gray-900">₹{selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                  <p className="font-semibold text-gray-900">₹{(selectedCustomer.avgOrderValue || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Last Order</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.lastOrder}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recent Orders</h4>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #100{i}</p>
                        <p className="text-xs text-gray-500">2024-12-0{6-i}</p>
                      </div>
                      <span className="font-semibold text-gray-900">₹{(45.50 * i).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
