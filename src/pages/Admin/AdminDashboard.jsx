import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    customers: 0,
    menuItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch all stats in parallel
        const [ordersRes, usersRes, menuRes, recentOrdersRes, topItemsRes] = await Promise.all([
          fetch('/api/v1/orders/stats/overview', { headers }),
          fetch('/api/v1/users/stats/overview', { headers }),
          fetch('/api/v1/menu/stats/overview', { headers }),
          fetch('/api/v1/orders?limit=5&sort=-createdAt', { headers }),
          fetch('/api/v1/menu/popular/items?limit=5', { headers })
        ]);

        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();
        const menuData = await menuRes.json();
        const recentOrdersData = await recentOrdersRes.json();
        const topItemsData = await topItemsRes.json();

        // Set stats
        if (ordersData.data && usersData.data && menuData.data) {
          setStats({
            totalOrders: ordersData.data.overview?.totalOrders || 0,
            revenue: ordersData.data.overview?.totalRevenue || 0,
            customers: usersData.data.customerStats?.totalCustomers || 0,
            menuItems: menuData.data.overview?.totalItems || 0,
          });
        }

        // Set recent orders
        if (recentOrdersData.data?.orders) {
          setRecentOrders(recentOrdersData.data.orders);
        }

        // Set top items (actual menu items, not categories)
        if (topItemsData.data?.menuItems) {
          const items = topItemsData.data.menuItems.map(item => ({
            name: item.name,
            orders: item.stats?.totalOrders || 0,
            revenue: item.stats?.totalRevenue || 0,
            image: item.image
          }));
          setTopDishes(items);
        }

        // Generate sales data from order stats by status
        if (ordersData.data?.statusStats) {
          const statusData = ordersData.data.statusStats.map(stat => ({
            label: stat._id,
            value: stat.count,
            revenue: stat.totalRevenue || 0
          }));
          setSalesData(statusData);
        } else {
          // Fallback: generate sample data based on total
          const total = ordersData.data?.overview?.totalOrders || 0;
          setSalesData([
            { label: 'DELIVERED', value: Math.round(total * 0.7), revenue: 0 },
            { label: 'PENDING', value: Math.round(total * 0.15), revenue: 0 },
            { label: 'PREPARING', value: Math.round(total * 0.1), revenue: 0 },
            { label: 'CANCELLED', value: Math.round(total * 0.05), revenue: 0 }
          ]);
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "PREPARING": return "bg-blue-100 text-blue-800";
      case "OUT_FOR_DELIVERY": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-stone-100 text-gray-800";
      case "READY": return "bg-purple-100 text-purple-800";
      default: return "bg-stone-100 text-gray-800";
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const statsData = [
    {
      title: "Total Orders",
      value: loading ? "..." : stats.totalOrders.toLocaleString(),
      change: "+12.5%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "bg-blue-500",
    },
    {
      title: "Revenue",
      value: loading ? "..." : `₹${stats.revenue.toLocaleString()}`,
      change: "+8.2%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-green-500",
    },
    {
      title: "Customers",
      value: loading ? "..." : stats.customers.toLocaleString(),
      change: "+5.7%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "bg-purple-500",
    },
    {
      title: "Menu Items",
      value: loading ? "..." : stats.menuItems.toLocaleString(),
      change: "+2.4%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: "bg-red-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 poppins-bold poppins-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600 poppins-regular">Welcome back! Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 poppins-medium">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 poppins-bold poppins-bold">{stat.value}</p>
                <p className="mt-2 text-sm text-green-600 poppins-regular">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 poppins-bold mb-4">Sales Overview by Status</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="animate-pulse">Loading chart...</div>
            </div>
          ) : salesData.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              {(() => {
                // Calculate total and percentages
                const total = salesData.reduce((sum, item) => sum + item.value, 0);
                if (total === 0) return <div className="text-gray-400">No data available</div>;
                
                // Map colors based on status name
                const getColorByStatus = (status) => {
                  const upperStatus = status.toUpperCase();
                  if (upperStatus.includes('DELIVER')) return { fill: '#22c55e', hex: '#22c55e' };
                  if (upperStatus.includes('PENDING')) return { fill: '#eab308', hex: '#eab308' };
                  if (upperStatus.includes('PREPAR') || upperStatus.includes('READY')) return { fill: '#3b82f6', hex: '#3b82f6' };
                  if (upperStatus.includes('CANCEL')) return { fill: '#ef4444', hex: '#ef4444' };
                  if (upperStatus.includes('OUT_FOR_DELIVERY')) return { fill: '#f97316', hex: '#f97316' };
                  return { fill: '#6b7280', hex: '#6b7280' };
                };
                
                // Generate pie chart slices
                let currentAngle = -90; // Start from top
                const slices = salesData.map((item, index) => {
                  const percentage = (item.value / total) * 100;
                  const sliceAngle = (item.value / total) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + sliceAngle;
                  currentAngle = endAngle;
                  
                  // Calculate slice path
                  const radius = 80;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  const x1 = 100 + radius * Math.cos(startRad);
                  const y1 = 100 + radius * Math.sin(startRad);
                  const x2 = 100 + radius * Math.cos(endRad);
                  const y2 = 100 + radius * Math.sin(endRad);
                  const largeArc = sliceAngle > 180 ? 1 : 0;
                  
                  return {
                    ...item,
                    percentage,
                    path: `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
                    color: getColorByStatus(item.label)
                  };
                });
                
                return (
                  <div className="flex items-center gap-8">
                    {/* Pie Chart */}
                    <div className="relative">
                      <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                        {slices.map((slice, index) => (
                          <g key={index} className="group cursor-pointer">
                            <path
                              d={slice.path}
                              fill={slice.color.fill}
                              className="transition-all duration-200 hover:opacity-80"
                              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                            />
                            <title>{slice.label}: {slice.value} orders ({slice.percentage.toFixed(1)}%)</title>
                          </g>
                        ))}
                        {/* Center circle for donut effect */}
                        <circle cx="100" cy="100" r="45" fill="white" />
                      </svg>
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-gray-900 poppins-bold">{total}</div>
                        <div className="text-xs text-gray-600 poppins-regular">Total Orders</div>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-col gap-2">
                      {slices.map((slice, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: slice.color.hex }}
                          ></div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 poppins-medium">
                              {slice.label.replace(/_/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                            <span className="text-gray-600 poppins-regular ml-2">
                              {slice.value} ({slice.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center poppins-regular">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No sales data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 poppins-bold mb-4">Top 5 Items</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : topDishes.length > 0 ? (
            <div className="space-y-4">
              {topDishes.map((dish, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <span className="text-red-400 font-bold poppins-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 poppins-medium">{dish.name}</p>
                      <p className="text-sm text-gray-500 poppins-regular">{dish.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold poppins-semibold">₹{Math.round(dish.revenue).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md border border-stone-200">
        <div className="p-6 border-b border-stone-200 ">
          <h2 className="text-xl font-bold text-gray-900 ">Recent Orders</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-pulse">Loading orders...</div>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 ">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order, index) => (
                  <tr key={order._id || index} className="hover:bg-stone-50 ">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ">
                      {order.orderNumber || `#${order._id?.slice(-8)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                      {order.customer?.name || 'Guest'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 ">
                      ₹{order.pricing?.finalAmount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {formatTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Orders</h3>
            <p className="text-gray-600">Orders will appear here once customers start placing them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
