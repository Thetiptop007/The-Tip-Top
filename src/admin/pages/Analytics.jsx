export default function Analytics() {
  const weeklyData = [
    { day: 'Mon', revenue: 4200, orders: 45 },
    { day: 'Tue', revenue: 3800, orders: 38 },
    { day: 'Wed', revenue: 5100, orders: 52 },
    { day: 'Thu', revenue: 4600, orders: 48 },
    { day: 'Fri', revenue: 6200, orders: 68 },
    { day: 'Sat', revenue: 7800, orders: 85 },
    { day: 'Sun', revenue: 6500, orders: 72 },
  ];

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));

  const popularItems = [
    { name: 'Margherita Pizza', orders: 145, revenue: 1883, percentage: 85 },
    { name: 'Caesar Salad', orders: 112, revenue: 1007, percentage: 65 },
    { name: 'Tiramisu', orders: 98, revenue: 685, percentage: 55 },
    { name: 'Iced Latte', orders: 87, revenue: 434, percentage: 45 },
    { name: 'Pasta Carbonara', orders: 76, revenue: 988, percentage: 40 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
            Last 7 Days
          </button>
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-md">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Revenue</h3>
          <div className="flex items-end justify-between h-64 gap-4">
            {weeklyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg absolute bottom-0 transition-all duration-500 hover:from-red-600 hover:to-red-500"
                    style={{ height: `₹{(data.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-900 whitespace-nowrap">
                      ₹{(data.revenue / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Orders Chart */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Orders</h3>
          <div className="flex items-end justify-between h-64 gap-4">
            {weeklyData.map((data, index) => {
              const maxOrders = Math.max(...weeklyData.map(d => d.orders));
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg absolute bottom-0 transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `₹{(data.orders / maxOrders) * 100}%` }}
                    >
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-900">
                        {data.orders}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{data.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Items</h3>
        <div className="space-y-4">
          {popularItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-red-600">#{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">₹{item.revenue}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.orders} orders)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `₹{item.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
