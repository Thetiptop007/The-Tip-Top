import { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch customer stats
  useEffect(() => {
    let mounted = true;
    fetch(getApiUrl('api/v1/users/stats/overview'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data && data.data && data.data.customerStats) {
          const cs = data.data.customerStats;
          setStats({
            totalCustomers: cs.totalCustomers || 0,
            totalOrders: cs.totalOrders || 0,
            totalRevenue: cs.totalSpent || 0,
            avgOrderValue: cs.totalOrders > 0 ? Math.round(cs.totalSpent / cs.totalOrders) : 0
          });
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Fetch customers
  useEffect(() => {
    let mounted = true;
    
    async function loadCustomers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('limit', limit);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());

        const res = await fetch(getApiUrl(`api/v1/users/role/customer?${params.toString()}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        if (!mounted) return;
        
        if (json && json.data) {
          setCustomers(json.data.users || []);
          setTotalItems(json.pagination?.totalItems || 0);
          setTotalPages(json.pagination?.totalPages || 1);
        }
      } catch (err) {
        if (mounted) {
          alert('Failed to load customers. Please ensure the backend server is running.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCustomers();
    return () => { mounted = false; };
  }, [page, limit, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCustomerName = (user) => {
    if (!user) return 'Unknown';
    // Handle both string name and object name {first, last}
    if (typeof user.name === 'string') {
      return user.name || 'Unknown';
    } else if (user.name && typeof user.name === 'object') {
      return `${user.name.first || ''} ${user.name.last || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  };

  const getCustomerEmail = (user) => {
    if (!user) return 'N/A';
    // Handle both string email and object email {address}
    if (typeof user.email === 'string') {
      return user.email || 'N/A';
    } else if (user.email && typeof user.email === 'object') {
      return user.email.address || 'N/A';
    }
    return 'N/A';
  };

  const getCustomerPhone = (user) => {
    if (!user) return 'N/A';
    // Handle both string phone and object phone {number}
    if (typeof user.phone === 'string') {
      return user.phone || 'N/A';
    } else if (user.phone && typeof user.phone === 'object') {
      return user.phone.number || 'N/A';
    }
    return 'N/A';
  };

  const getCustomerAddress = (user) => {
    if (!user || !user.addresses || user.addresses.length === 0) return 'No address available';
    const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
    return `${defaultAddr.street || ''}, ${defaultAddr.city || ''}, ${defaultAddr.state || ''} - ${defaultAddr.zipCode || ''}`.trim();
  };

  const getInitials = (name) => {
    const parts = name.split(' ').filter(p => p);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 poppins-bold">Customers</h1>
          <p className="mt-1 text-sm text-gray-600 poppins-regular">View and manage your restaurant customers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 poppins-medium text-xs shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent poppins-regular"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 poppins-medium">Total Customers</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 poppins-bold">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 poppins-medium">Total Orders</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 poppins-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 poppins-medium">Total Revenue</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 poppins-bold">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-600 poppins-medium">Avg. Order Value</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 poppins-bold">
            ₹{stats.avgOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-3 text-xs text-gray-600 poppins-regular">Loading customers...</p>
        </div>
      ) : customers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide poppins-medium">Customer</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide poppins-medium">Contact</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide poppins-medium">Address</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide poppins-medium">Orders</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide poppins-medium">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => {
                  const name = getCustomerName(customer);
                  const email = getCustomerEmail(customer);
                  const phone = getCustomerPhone(customer);
                  const address = getCustomerAddress(customer);
                  const totalOrders = customer.customerData?.totalOrders || 0;
                  const totalSpent = customer.customerData?.totalSpent || 0;
                  const joinedDate = customer.createdAt;

                  return (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-semibold poppins-semibold">
                            {getInitials(name)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900 poppins-medium">{name}</p>
                            <p className="text-[10px] text-gray-500 poppins-regular">Joined {formatDate(joinedDate)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-gray-900 poppins-regular">{email}</p>
                        <p className="text-[10px] text-gray-500 poppins-regular">{phone}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-gray-900 poppins-regular max-w-xs">{address}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-gray-900 poppins-semibold">{totalOrders}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-gray-900 poppins-semibold">₹{totalSpent.toLocaleString()}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5 poppins-semibold">No Customers Found</h3>
          <p className="text-xs text-gray-600 poppins-regular">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && customers.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-600">
            Showing page {page} of {totalPages} — {totalItems} customers
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              className="px-3 py-1.5 text-xs bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const displayStart = Math.max(1, page - 2);
              const pNum = displayStart + i;
              if (pNum > totalPages) return null;
              return (
                <button 
                  key={pNum} 
                  onClick={() => setPage(pNum)} 
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    pNum === page 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              className="px-3 py-1.5 text-xs bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              Next
            </button>
            <select 
              value={limit} 
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }} 
              className="ml-1.5 px-2 py-1 text-xs border border-gray-200 rounded-md"
            >
              {[10, 20, 50, 100].map(n => (<option key={n} value={n}>{n} / page</option>))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
