import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config/api';

const Orders = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  
  // Delivery partners state
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [assigningPartner, setAssigningPartner] = useState(false);
  
  // Status update animation state
  const [updatingOrders, setUpdatingOrders] = useState({}); // {orderId: {status, oldStatus, undoTimeout}}
  const [toast, setToast] = useState(null); // {message, orderId, oldStatus, newStatus}
  const [fadingOutOrders, setFadingOutOrders] = useState({}); // {orderId: true}

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
    fetchDeliveryPartners();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      console.log('🔑 Fetching orders with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      const response = await fetch(getApiUrl('api/v1/orders'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Orders API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Orders fetched successfully:', data.length || data.data?.length || 0, 'orders');
        
        // Handle both data formats: {data: {orders: []}} or direct array
        const orders = data.data?.orders || data.data || data;
        setAllOrders(Array.isArray(orders) ? orders : []);
        setIsUsingFallbackData(false);
      } else if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication failed:', response.status);
        setError('Session expired or unauthorized. Please login again.');
        setAllOrders([]);
        setIsUsingFallbackData(false);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      } else if (response.status === 404) {
        console.warn('⚠️ Orders endpoint not found');
        setError('Orders endpoint not found. Using sample data for demonstration.');
        setAllOrders(getSampleOrders());
        setIsUsingFallbackData(true);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        setError(errorData.message || 'Failed to fetch orders. Using sample data.');
        setAllOrders(getSampleOrders());
        setIsUsingFallbackData(true);
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
        setError('Cannot connect to server. Please ensure the backend is running on port 5000. Using sample data for demonstration.');
      } else {
        setError('Network error occurred. Using sample data for demonstration.');
      }
      setAllOrders(getSampleOrders());
      setIsUsingFallbackData(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available delivery partners
  const fetchDeliveryPartners = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('api/v1/delivery/partners'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeliveryPartners(data.data?.partners || []);
      }
    } catch (error) {
      console.error('Failed to fetch delivery partners:', error);
    }
  };

  // Assign delivery partner to order
  const assignDeliveryPartner = async (orderId, partnerId) => {
    try {
      setAssigningPartner(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl(`api/v1/orders/${orderId}/assign`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ partnerId: partnerId })
      });
      
      if (response.ok) {
        alert('Delivery partner assigned successfully!');
        setShowAssignModal(false);
        fetchOrders();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to assign delivery partner' }));
        alert(errorData.message || 'Failed to assign delivery partner');
      }
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      alert('Failed to assign delivery partner');
    } finally {
      setAssigningPartner(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      // Update UI immediately
      setAllOrders(prevOrders => 
        prevOrders.map(o => 
          o._id === orderId ? { ...o, paymentStatus } : o
        )
      );
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl(`api/v1/orders/${orderId}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus })
      });
      
      if (response.ok) {
        // Show brief success feedback
        setToast({
          message: `Payment status updated to ${paymentStatus}`,
          orderId,
          oldStatus: null,
          newStatus: paymentStatus
        });
        
        setTimeout(() => {
          setToast(null);
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update payment status' }));
        alert(errorData.message || 'Failed to update payment status');
        // Revert on error
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
      // Revert on error
      fetchOrders();
    }
  };

  // Sample data matching backend schema
  const getSampleOrders = () => [
    { 
      _id: "1",
      orderNumber: "ORD-001", 
      customer: { name: "John Doe", phone: "+91 9876543210", email: "john@example.com" },
      deliveryAddress: {
        street: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001"
      },
      items: [
        { name: "Margherita Pizza", quantity: 2, price: 250, subtotal: 500 },
        { name: "Coke", quantity: 1, price: 40, subtotal: 40 }
      ],
      pricing: {
        itemsTotal: 540,
        deliveryFee: 40,
        gst: 27,
        finalAmount: 607
      },
      status: "PENDING",
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toISOString()
    },
    { 
      _id: "2",
      orderNumber: "ORD-002", 
      customer: { name: "Jane Smith", phone: "+91 9876543211", email: "jane@example.com" },
      deliveryAddress: {
        street: "456 Park Ave",
        city: "Delhi",
        state: "NCR",
        zipCode: "110001"
      },
      items: [
        { name: "Chicken Burger", quantity: 1, price: 180, subtotal: 180 },
        { name: "French Fries", quantity: 1, price: 80, subtotal: 80 }
      ],
      pricing: {
        itemsTotal: 260,
        deliveryFee: 30,
        gst: 13,
        finalAmount: 303
      },
      status: "READY",
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60000).toISOString()
    },
    { 
      _id: "3",
      orderNumber: "ORD-003", 
      customer: { name: "Mike Johnson", phone: "+91 9876543212", email: "mike@example.com" },
      deliveryAddress: {
        street: "789 Lake Road",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560001"
      },
      items: [
        { name: "Pasta Carbonara", quantity: 2, price: 320, subtotal: 640 },
        { name: "Caesar Salad", quantity: 2, price: 120, subtotal: 240 }
      ],
      pricing: {
        itemsTotal: 880,
        deliveryFee: 50,
        gst: 44,
        finalAmount: 974
      },
      status: "OUT_FOR_DELIVERY",
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 15 * 60000).toISOString()
    },
    { 
      _id: "4",
      orderNumber: "ORD-004", 
      customer: { name: "Sarah Williams", phone: "+91 9876543213", email: "sarah@example.com" },
      deliveryAddress: {
        street: "321 Beach Side",
        city: "Goa",
        state: "Goa",
        zipCode: "403001"
      },
      items: [
        { name: "Caesar Salad", quantity: 1, price: 120, subtotal: 120 }
      ],
      pricing: {
        itemsTotal: 120,
        deliveryFee: 30,
        gst: 6,
        finalAmount: 156
      },
      status: "DELIVERED",
      paymentMethod: "COD",
      paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      estimatedDeliveryTime: new Date(Date.now() - 30 * 60000).toISOString()
    },
  ];

  const statusOptions = ['PENDING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'All'];

  const filteredOrders = allOrders.filter(order => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "READY": return "bg-purple-100 text-purple-800";
      case "OUT_FOR_DELIVERY": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-blue-100 text-blue-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "OUT_FOR_DELIVERY": return "Out for Delivery";
      case "PENDING": return "Pending";
      case "READY": return "Ready";
      case "DELIVERED": return "Delivered";
      case "COMPLETED": return "Completed";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = allOrders.find(o => o._id === orderId);
      if (!order) return;
      
      const oldStatus = order.status;
      
      // Handle special cases first
      if (newStatus === 'OUT_FOR_DELIVERY') {
        if (order && !order.deliveryPartner) {
          setSelectedOrderForAssign(order);
          setShowAssignModal(true);
        } else {
          alert('Delivery partner already assigned or order not found.');
        }
        return;
      }
      
      if (newStatus === 'DELIVERED') {
        alert('Order delivery should be marked by the delivery partner.');
        return;
      }

      let endpoint = '';
      let method = 'PATCH';
      let body = {};

      // Map status to backend endpoint
      switch (newStatus) {
        case 'READY':
          endpoint = `/api/v1/orders/${orderId}/ready`;
          break;
        case 'CANCELLED':
          endpoint = `/api/v1/orders/${orderId}/admin-cancel`;
          break;
        default:
          alert(`Cannot change status to ${getStatusLabel(newStatus)} from admin panel.`);
          return;
      }

      // Immediately update UI with new status
      setAllOrders(prevOrders => 
        prevOrders.map(o => 
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
      
      // Mark as updating with animation
      setUpdatingOrders(prev => ({
        ...prev,
        [orderId]: { status: newStatus, oldStatus }
      }));

      const response = await fetch(getApiUrl(endpoint), {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        // Show success toast with undo option
        setToast({
          message: `Order moved to ${getStatusLabel(newStatus)}`,
          orderId,
          oldStatus,
          newStatus
        });
        
        // Auto dismiss toast after 3 seconds
        setTimeout(() => {
          setToast(null);
        }, 3000);
        
        // Start fade-out after 2 seconds
        setTimeout(() => {
          setFadingOutOrders(prev => ({ ...prev, [orderId]: true }));
          
          // Remove from view after fade animation (1 second)
          setTimeout(() => {
            setUpdatingOrders(prev => {
              const newState = { ...prev };
              delete newState[orderId];
              return newState;
            });
            setFadingOutOrders(prev => {
              const newState = { ...prev };
              delete newState[orderId];
              return newState;
            });
            // Refresh to get updated data
            fetchOrders();
          }, 1000);
        }, 2000);
      } else {
        // Revert on error
        setAllOrders(prevOrders => 
          prevOrders.map(o => 
            o._id === orderId ? { ...o, status: oldStatus } : o
          )
        );
        setUpdatingOrders(prev => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
        });
        
        const errorData = await response.json().catch(() => ({ message: 'Failed to update order status' }));
        alert(errorData.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Revert on error
      const order = allOrders.find(o => o._id === orderId);
      if (order && updatingOrders[orderId]) {
        setAllOrders(prevOrders => 
          prevOrders.map(o => 
            o._id === orderId ? { ...o, status: updatingOrders[orderId].oldStatus } : o
          )
        );
        setUpdatingOrders(prev => {
          const newState = { ...prev };
          delete newState[orderId];
          return newState;
        });
      }
      
      alert('Failed to update order status');
    }
  };

  // Complete takeaway order
  const completeTakeawayOrder = async (orderId, orderNumber) => {
    if (!confirm(`Mark takeaway order ${orderNumber} as completed?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl(`api/v1/orders/${orderId}/complete-takeaway`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(`Takeaway order ${orderNumber} completed!`);
        fetchOrders(); // Refresh orders
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to complete takeaway order');
      }
    } catch (error) {
      console.error('Error completing takeaway order:', error);
      alert('Failed to complete takeaway order');
    }
  };
  
  const undoStatusChange = async (orderId, oldStatus) => {
    try {
      // Clear toast immediately
      setToast(null);
      
      // Revert UI immediately
      setAllOrders(prevOrders => 
        prevOrders.map(o => 
          o._id === orderId ? { ...o, status: oldStatus } : o
        )
      );
      
      // Clear animation states
      setUpdatingOrders(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      setFadingOutOrders(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      
      // Call backend to revert (you may need to add this endpoint or use a general update endpoint)
      const token = localStorage.getItem('adminToken');
      await fetch(getApiUrl(`api/v1/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: oldStatus })
      });
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error undoing status change:', error);
      fetchOrders();
    }
  };

  const printReceipt = (order) => {
    // Create a hidden iframe for printing
    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.width = '0';
    printWindow.style.height = '0';
    printWindow.style.border = 'none';
    
    document.body.appendChild(printWindow);
    
    const doc = printWindow.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${order.orderNumber}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0 auto;
              padding: 10mm;
              font-size: 12px;
              line-height: 1.4;
            }
            
            .header {
              text-align: center;
              margin-bottom: 15px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            
            .restaurant-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .restaurant-info {
              font-size: 10px;
              margin: 2px 0;
            }
            
            .order-info {
              margin: 15px 0;
              font-size: 11px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            
            .section-title {
              font-weight: bold;
              margin-top: 15px;
              margin-bottom: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 3px;
            }
            
            .customer-info {
              font-size: 11px;
              margin-bottom: 15px;
            }
            
            .items-table {
              width: 100%;
              margin: 15px 0;
              border-collapse: collapse;
            }
            
            .items-table th {
              text-align: left;
              border-bottom: 1px solid #000;
              padding: 5px 0;
              font-size: 11px;
            }
            
            .items-table td {
              padding: 5px 0;
              font-size: 11px;
            }
            
            .item-name {
              width: 60%;
            }
            
            .item-qty {
              width: 15%;
              text-align: center;
            }
            
            .item-price {
              width: 25%;
              text-align: right;
            }
            
            .totals {
              margin-top: 15px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 11px;
            }
            
            .total-row.grand-total {
              font-size: 14px;
              font-weight: bold;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid #000;
            }
            
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px dashed #000;
              font-size: 10px;
            }
            
            .thank-you {
              font-weight: bold;
              margin: 10px 0;
            }
            
            .payment-info {
              margin: 10px 0;
              padding: 8px;
              background: #f0f0f0;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="restaurant-name">THE TIP TOP</div>
            <div class="restaurant-info">Restaurant & Cafe</div>
            <div class="restaurant-info">123 Main Street, City</div>
            <div class="restaurant-info">Phone: +91 1234567890</div>
            <div class="restaurant-info">GST: 27XXXXX1234X1XX</div>
          </div>
          
          <div class="order-info">
            <div class="info-row">
              <span><strong>Order ID:</strong></span>
              <span>${order.orderNumber}</span>
            </div>
            <div class="info-row">
              <span><strong>Date:</strong></span>
              <span>${new Date(order.createdAt).toLocaleString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</span>
            </div>
            <div class="info-row">
              <span><strong>Status:</strong></span>
              <span>${getStatusLabel(order.status)}</span>
            </div>
          </div>
          
          <div class="section-title">CUSTOMER DETAILS</div>
          <div class="customer-info">
            <div><strong>Name:</strong> ${order.customer.name}</div>
            <div><strong>Phone:</strong> ${order.customer.phone}</div>
            <div><strong>Email:</strong> ${order.customer.email}</div>
            <div><strong>Address:</strong> ${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}</div>
          </div>
          
          <div class="section-title">ORDER ITEMS</div>
          <table class="items-table">
            <thead>
              <tr>
                <th class="item-name">Item</th>
                <th class="item-qty">Qty</th>
                <th class="item-price">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td class="item-name">${item.name}</td>
                  <td class="item-qty">${item.quantity}</td>
                  <td class="item-price">₹${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Items Total:</span>
              <span>₹${order.pricing.itemsTotal}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>₹${order.pricing.deliveryFee}</span>
            </div>
            <div class="total-row">
              <span>GST:</span>
              <span>₹${order.pricing.gst}</span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>₹${order.pricing.finalAmount}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div style="text-align: center;">
              <strong>Payment Method:</strong> ${order.paymentMethod}
            </div>
            <div style="text-align: center; margin-top: 5px;">
              <strong>Payment Status:</strong> ${order.paymentStatus}
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">THANK YOU FOR YOUR ORDER!</div>
            <div>Visit us again at www.thetiptop.com</div>
            <div style="margin-top: 10px;">This is a computer generated receipt</div>
          </div>
        </body>
      </html>
    `);
    doc.close();
    
    // Wait for content to load, then print
    printWindow.contentWindow.onload = function() {
      setTimeout(() => {
        printWindow.contentWindow.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(printWindow);
        }, 100);
      }, 250);
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 poppins-bold">Orders Management</h1>
          <p className="mt-2 text-gray-600 poppins-regular">Track and manage all restaurant orders in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-stone-300 hover:bg-stone-50 flex items-center gap-2 poppins-medium shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button 
            onClick={fetchOrders}
            disabled={loading}
            className={`px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2 poppins-medium shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error/Warning Banner */}
      {error && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          isUsingFallbackData 
            ? 'bg-yellow-50 border border-yellow-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <svg 
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isUsingFallbackData ? 'text-yellow-600' : 'text-red-600'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <div className="flex-1">
            <h3 className={`font-semibold poppins-semibold ${
              isUsingFallbackData ? 'text-yellow-900' : 'text-red-900'
            }`}>
              {isUsingFallbackData ? 'Using Demo Data' : 'Connection Error'}
            </h3>
            <p className={`text-sm mt-1 poppins-regular ${
              isUsingFallbackData ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {error}
            </p>
            {isUsingFallbackData && (
              <button
                onClick={fetchOrders}
                className="mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline poppins-medium"
              >
                Try connecting again
              </button>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className={`flex-shrink-0 ${
              isUsingFallbackData ? 'text-yellow-600 hover:text-yellow-800' : 'text-red-600 hover:text-red-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && allOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <svg className="w-12 h-12 text-red-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 poppins-semibold">Loading Orders...</h3>
            <p className="text-gray-600 poppins-regular">Please wait while we fetch the latest orders</p>
          </div>
        </div>
      )}

      {/* Search and Filters - Only show when we have data or finished loading */}
      {!loading || allOrders.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow-md border border-stone-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer name, or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Status Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-red-400 text-white'
                        : 'bg-stone-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Display - Grid or Table based on filter */}
          {selectedStatus === 'All' ? (
            /* Table View for All Orders */
            <div className="bg-white rounded-lg shadow-md border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                          <div className="text-xs text-gray-500">{order.customer.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold inline-block ${
                              order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {order.paymentMethod}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold inline-block ${
                              order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 
                              order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-lg font-bold text-red-500">₹{order.pricing.finalAmount}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View for Filtered Orders */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
              {filteredOrders.map((order) => {
              const isUpdating = updatingOrders[order._id];
              const isFadingOut = fadingOutOrders[order._id];
              
              return (
              <div 
                key={order._id} 
                className={`bg-white rounded-lg shadow-md border border-stone-200 hover:shadow-lg transition-all duration-1000 ${
                  isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                } ${isUpdating ? 'ring-2 ring-green-400' : ''}`}
              >
            <div className="p-4 border-b border-stone-200 ">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 ">#{order.orderNumber}</h3>
                <div className="flex items-center gap-2">
                  {/* Order Type Badge */}
                  {order.orderType === 'TAKEAWAY' && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      🥡 Takeaway
                    </span>
                  )}
                  {order.placedBy === 'ADMIN' && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                      👤 Admin
                    </span>
                  )}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-500 ${getStatusColor(order.status)} ${isUpdating ? 'animate-pulse ring-2 ring-green-300' : ''}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {isUpdating && (
                    <span className="text-xs text-green-600 font-semibold animate-pulse">✓ Updated</span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 ">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(order.createdAt).toLocaleString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Customer Info */}
              <div className="bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Details
                </p>
                <p className="text-sm font-semibold text-gray-900 ">{order.customer.name}</p>
                <p className="text-xs text-gray-600 ">{order.customer.phone}</p>
                {order.customer.email && (
                  <p className="text-xs text-gray-600 ">{order.customer.email}</p>
                )}
                <div className="mt-2 pt-2 border-t border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivery Address
                  </p>
                  <p className="text-xs text-gray-600 ">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-stone-200  pt-3">
                <p className="text-xs font-semibold text-gray-700  mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Items
                </p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1 pl-5">
                    <span className="text-gray-600 ">{item.name} <span className="text-xs text-gray-500">×{item.quantity}</span></span>
                    <span className="text-gray-900  font-medium">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Payment & Pricing */}
              <div className="bg-gradient-to-r from-green-50 to-white p-3 rounded-lg border border-green-100">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Items Total:</span>
                  <span>₹{order.pricing.itemsTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Delivery Fee:</span>
                  <span>₹{order.pricing.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>GST:</span>
                  <span>₹{order.pricing.gst}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="text-sm font-bold text-gray-700 ">Total Amount:</span>
                  <span className="text-lg font-bold text-red-500 ">₹{order.pricing.finalAmount}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {order.paymentMethod}
                    </span>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold cursor-pointer border-none outline-none transition-colors ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                        order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 
                        'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="COLLECTED">COLLECTED</option>
                    </select>
                  </div>
                  <span className="text-xs text-gray-500 ">
                    ETA: {new Date(order.estimatedDeliveryTime).toLocaleString('en-IN', { 
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

              {/* Delivery Partner Info (if assigned) */}
              {order.deliveryPartner && (
                <div className="bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    Delivery Partner
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{order.deliveryPartner.name}</p>
                  <p className="text-xs text-gray-600">{order.deliveryPartner.phone}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => printReceipt(order)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1"
                  title="Print Receipt"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                
                {/* Takeaway Complete Button */}
                {order.orderType === 'TAKEAWAY' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => completeTakeawayOrder(order._id, order.orderNumber)}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete Takeaway
                  </button>
                )}
                
                {/* Assign Delivery Button (only for DELIVERY orders) */}
                {order.orderType !== 'TAKEAWAY' && !order.deliveryPartner && (order.status === 'PENDING' || order.status === 'READY') && (
                  <button
                    onClick={() => {
                      setSelectedOrderForAssign(order);
                      setShowAssignModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Assign Delivery
                  </button>
                )}
                
                {/* Status Change Dropdown (only for DELIVERY orders) */}
                {order.orderType !== 'TAKEAWAY' && (
                  <select
                    onChange={(e) => {
                      if (e.target.value !== order.status) {
                        updateOrderStatus(order._id, e.target.value);
                      }
                    }}
                    value={order.status}
                    className="flex-1 px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <option value={order.status}>Change Status</option>
                    {order.status === 'PENDING' && <option value="READY">✓ Mark as Ready</option>}
                    {order.status === 'PENDING' && <option value="CANCELLED">✗ Cancel Order</option>}
                    {order.status === 'READY' && <option value="CANCELLED">✗ Cancel Order</option>}
                    {(order.status === 'PENDING' || order.status === 'READY') && order.deliveryPartner && (
                      <option value="OUT_FOR_DELIVERY">🚚 Out for Delivery</option>
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>
            );
          })}
      </div>
          )}

      {filteredOrders.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900  mb-2">No Orders Found</h3>
          <p className="text-gray-600 ">Try adjusting your search or filter criteria</p>
        </div>
      )}
      </> 
      ) : null}

      {/* Toast Notification with Undo */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 min-w-[320px]">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">{toast.message}</p>
              <p className="text-xs text-green-100 mt-1">Order #{allOrders.find(o => o._id === toast.orderId)?.orderNumber}</p>
            </div>
            <button
              onClick={() => undoStatusChange(toast.orderId, toast.oldStatus)}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold text-sm cursor-pointer"
            >
              Undo
            </button>
            <button
              onClick={() => setToast(null)}
              className="text-white hover:text-green-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Assign Delivery Partner Modal */}
      {showAssignModal && selectedOrderForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-xl font-bold text-gray-900">Assign Delivery Partner</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-gray-600 mb-4">
                Order: <span className="font-semibold text-gray-900">#{selectedOrderForAssign.orderNumber}</span>
              </p>
              
              {deliveryPartners.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No delivery partners available</p>
              ) : (
                <div className="space-y-3">
                  {deliveryPartners.filter(partner => partner.status === 'Active').map((partner) => (
                    <button
                      key={partner._id}
                      onClick={() => assignDeliveryPartner(selectedOrderForAssign._id, partner._id)}
                      disabled={assigningPartner}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{partner.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{partner.phone || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              partner.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {partner.status === 'Active' ? 'Available' : 'Busy'}
                            </span>
                            {partner.rating && (
                              <span className="text-xs text-gray-600">
                                ⭐ {partner.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
