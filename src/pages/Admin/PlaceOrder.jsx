import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../../config/api';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  
  // Initialize from sessionStorage
  const [selectedItems, setSelectedItems] = useState(() => {
    const saved = sessionStorage.getItem('placeOrderItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentStep, setCurrentStep] = useState(() => {
    const stepParam = searchParams.get('step');
    return stepParam ? parseInt(stepParam) : 1;
  }); // 1 = Select Items, 2 = Customer Details
  
  // Variant selection modal
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // Settings from backend
  const [settings, setSettings] = useState({
    taxRate: 5,
    deliveryCharge: 40,
  });
  
  // Filters for menu items
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [failedImages, setFailedImages] = useState(new Set());
  
  // Customer details - initialize from sessionStorage
  const [customerName, setCustomerName] = useState(() => {
    return sessionStorage.getItem('placeOrderCustomerName') || '';
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    return sessionStorage.getItem('placeOrderCustomerPhone') || '';
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    return sessionStorage.getItem('placeOrderCustomerEmail') || '';
  });
  
  // Order details - initialize from sessionStorage
  const [orderType, setOrderType] = useState(() => {
    return sessionStorage.getItem('placeOrderType') || 'DELIVERY';
  });
  const [paymentMethod, setPaymentMethod] = useState(() => {
    return sessionStorage.getItem('placeOrderPaymentMethod') || 'COD';
  });
  const [specialInstructions, setSpecialInstructions] = useState(() => {
    return sessionStorage.getItem('placeOrderInstructions') || '';
  });
  
  // Delivery address (only for DELIVERY type) - initialize from sessionStorage
  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    const saved = sessionStorage.getItem('placeOrderDeliveryAddress');
    return saved ? JSON.parse(saved) : {
      street: '',
      city: 'Phagwara',
      state: 'Punjab',
      zipCode: '144401',
      landmark: '',
    };
  });

  // Persist selectedItems to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('placeOrderItems', JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Persist customer details to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('placeOrderCustomerName', customerName);
  }, [customerName]);

  useEffect(() => {
    sessionStorage.setItem('placeOrderCustomerPhone', customerPhone);
  }, [customerPhone]);

  useEffect(() => {
    sessionStorage.setItem('placeOrderCustomerEmail', customerEmail);
  }, [customerEmail]);

  // Persist order details to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('placeOrderType', orderType);
  }, [orderType]);

  useEffect(() => {
    sessionStorage.setItem('placeOrderPaymentMethod', paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    sessionStorage.setItem('placeOrderInstructions', specialInstructions);
  }, [specialInstructions]);

  useEffect(() => {
    sessionStorage.setItem('placeOrderDeliveryAddress', JSON.stringify(deliveryAddress));
  }, [deliveryAddress]);

  // Update query parameter when step changes
  useEffect(() => {
    setSearchParams({ step: currentStep.toString() }, { replace: true });
  }, [currentStep, setSearchParams]);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl('api/v1/settings'));
        const data = await response.json();
        if (data.success) {
          setSettings({
            taxRate: data.data.settings.taxRate !== undefined ? data.data.settings.taxRate : 5,
            deliveryCharge: data.data.settings.deliveryCharge !== undefined ? data.data.settings.deliveryCharge : 40,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 450);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchMenuItems();
  }, [page, debouncedSearch, selectedCategory]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', limit);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
      
      const response = await fetch(getApiUrl(`api/v1/menu?${params.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMenuItems(data.data.menuItems.filter(item => item.isAvailable));
        setTotalItems(data.pagination?.totalItems || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from menu items (computed from all fetched items)
  const [allCategories, setAllCategories] = useState(['All']);
  
  useEffect(() => {
    // Fetch all categories from backend
    fetch(getApiUrl('api/v1/menu/categories/all'))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data && Array.isArray(data.data.categories)) {
          setAllCategories(['All', ...data.data.categories]);
        }
      })
      .catch(() => {});
  }, []);


  const handleImageError = (itemId) => {
    setFailedImages(prev => new Set([...prev, itemId]));
  };

  const handleItemClick = (menuItem) => {
    // If item has multiple variants, show modal
    if (menuItem.priceVariants && menuItem.priceVariants.length > 1) {
      setSelectedMenuItem(menuItem);
      setSelectedVariant(menuItem.priceVariants[0]);
      setShowVariantModal(true);
    } else {
      // If only one variant, add directly
      addItemToCart(menuItem, menuItem.priceVariants?.[0]);
    }
  };

  const addItemToCart = (menuItem, variant) => {
    const portion = variant?.quantity || 'Full';
    const price = variant?.price || 0;

    setSelectedItems([
      ...selectedItems,
      {
        menuItemId: menuItem._id,
        name: menuItem.name,
        portion,
        price,
        quantity: 1,
      },
    ]);
    
    // Close modal if open
    setShowVariantModal(false);
    setSelectedMenuItem(null);
    setSelectedVariant(null);
  };

  const handleAddVariant = () => {
    if (selectedMenuItem && selectedVariant) {
      addItemToCart(selectedMenuItem, selectedVariant);
    }
  };

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(1, quantity);
    setSelectedItems(updated);
  };

  const calculateTotal = () => {
    const itemsTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = orderType === 'DELIVERY' ? settings.deliveryCharge : 0;
    const taxAmount = Math.round((itemsTotal + deliveryFee) * (settings.taxRate / 100));
    const total = itemsTotal + deliveryFee + taxAmount;

    return { itemsTotal, deliveryFee, taxAmount, taxRate: settings.taxRate, total };
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (selectedItems.length === 0) {
        alert('Please add at least one item to proceed');
        return;
      }
      setCurrentStep(2);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!customerName || !customerPhone) {
      alert('Please enter customer name and phone');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress.street) {
      alert('Please enter delivery address');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('api/v1/orders/admin/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          items: selectedItems,
          orderType,
          deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
          paymentMethod,
          specialInstructions,
        }),
      });

      if (!response) {
        throw new Error('No response from server');
      }

      const data = await response.json();

      if (response.ok && data && data.status === 'success') {
        // Clear sessionStorage after successful order
        sessionStorage.removeItem('placeOrderItems');
        sessionStorage.removeItem('placeOrderCustomerName');
        sessionStorage.removeItem('placeOrderCustomerPhone');
        sessionStorage.removeItem('placeOrderCustomerEmail');
        sessionStorage.removeItem('placeOrderType');
        sessionStorage.removeItem('placeOrderPaymentMethod');
        sessionStorage.removeItem('placeOrderInstructions');
        sessionStorage.removeItem('placeOrderDeliveryAddress');
        
        alert(`Order ${data.data?.order?.orderNumber || ''} created successfully!`);
        navigate('/admin/orders');
      } else {
        alert(data?.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sigmar-regular">Place Order</h1>
              <p className="text-gray-600 poppins-regular mt-1">Create order for walk-in or phone customers</p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 poppins-medium"
            >
              ← Back to Orders
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 gap-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === 1 ? 'bg-red-400 text-white' : 'bg-green-500 text-white'
              }`}>
                {currentStep === 1 ? '1' : '✓'}
              </div>
              <span className={`ml-2 font-medium poppins-medium ${currentStep === 1 ? 'text-red-400' : 'text-green-500'}`}>
                Select Items
              </span>
            </div>
            <div className={`w-20 h-1 ${currentStep === 2 ? 'bg-red-400' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === 2 ? 'bg-red-400 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className={`ml-2 font-medium poppins-medium ${currentStep === 2 ? 'text-red-400' : 'text-gray-600'}`}>
                Customer Details
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Items */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 poppins-semibold">
                    Select Menu Items
                  </h2>
                  <span className="text-sm text-gray-500 poppins-regular">
                    {totalItems} items total
                  </span>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items by name..."
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                  />
                </div>

                {/* Category Filters */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium poppins-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-red-400 text-white shadow-md'
                          : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="col-span-full p-6 text-center poppins-regular">Loading...</div>
                  ) : menuItems.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 poppins-regular">No items found</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setPage(1);
                        }}
                        className="mt-3 text-red-400 hover:text-red-500 text-sm poppins-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    menuItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-lg shadow-md border border-stone-200 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        {/* Image Section */}
                        <div className="relative">
                          <div className="h-32 bg-gradient-to-br from-red-400 to-red-500 overflow-hidden">
                            {!failedImages.has(item._id) && item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(item._id)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-6xl">🍽️</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Badges */}
                          <div className="absolute top-2 right-2 flex gap-2">
                            {item.isVeg ? (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">VEG</span>
                            ) : (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">NON-VEG</span>
                            )}
                          </div>
                          
                          {/* Add Button Overlay */}
                          <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                +
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4">
                          <div className="mb-2">
                            <h3 className="text-base font-bold text-gray-900 poppins-bold line-clamp-1">{item.name}</h3>
                            <span className="text-xs text-gray-500 poppins-regular">
                              {item.categories?.[0] || 'Uncategorized'}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 poppins-regular line-clamp-2 mb-3">
                              {item.description}
                            </p>
                          )}
                          
                          {/* Price Variants */}
                          {item.priceVariants && item.priceVariants.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.priceVariants.slice(0, 3).map((variant, idx) => (
                                <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded poppins-regular">
                                  {variant.quantity}: ₹{variant.price}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Price and Rating */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold text-red-500 poppins-bold">
                              ₹{item.priceVariants?.[0]?.price || 'N/A'}
                            </span>
                            {item.rating && (
                              <div className="flex items-center gap-1 text-sm">
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-gray-700 poppins-regular">{item.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Pagination Controls */}
                {!loading && menuItems.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                    <div className="text-sm text-gray-600 poppins-regular">
                      Page {page} of {totalPages} — {totalItems} items total
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-2 bg-stone-100 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-200 transition-colors poppins-medium"
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
                            className={`px-3 py-2 rounded-md cursor-pointer transition-colors poppins-medium ${
                              pNum === page
                                ? 'bg-red-400 text-white'
                                : 'bg-stone-100 hover:bg-stone-200'
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      })}
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-2 bg-stone-100 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-200 transition-colors poppins-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 poppins-semibold mb-4">Cart</h2>
                
                <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                  {selectedItems.length === 0 ? (
                    <p className="text-gray-500 text-sm poppins-regular text-center py-8">
                      No items added yet.<br/>Start adding items from the menu.
                    </p>
                  ) : (
                    selectedItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium poppins-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 poppins-regular">₹{item.price} × {item.quantity}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-stone-300 rounded text-sm hover:bg-stone-100"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-stone-300 rounded text-sm hover:bg-stone-100"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedItems.length > 0 && (
                  <>
                    <div className="border-t border-stone-200 pt-3 mb-4">
                      <div className="flex justify-between text-sm poppins-regular mb-1">
                        <span>Items Total</span>
                        <span>₹{calculateTotal().itemsTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="w-full bg-red-400 text-white py-3 rounded-lg hover:bg-red-500 transition-colors font-medium poppins-medium shadow-md"
                    >
                      Continue to Customer Details →
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Customer Details */}
              <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 poppins-semibold mb-4">
                  Customer Details
                </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                    placeholder="9876543210"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Order Type */}
            <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 poppins-semibold mb-4">
                Order Type
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setOrderType('TAKEAWAY')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    orderType === 'TAKEAWAY'
                      ? 'border-red-400 bg-red-50 text-red-600'
                      : 'border-stone-200 bg-white text-gray-700 hover:border-stone-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🥡</div>
                    <div className="font-semibold poppins-semibold">Takeaway</div>
                    <div className="text-xs poppins-regular mt-1">Customer picks up</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    orderType === 'DELIVERY'
                      ? 'border-red-400 bg-red-50 text-red-600'
                      : 'border-stone-200 bg-white text-gray-700 hover:border-stone-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="font-semibold poppins-semibold">Delivery</div>
                    <div className="text-xs poppins-regular mt-1">Home delivery</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Delivery Address (only for DELIVERY) */}
            {orderType === 'DELIVERY' && (
              <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 poppins-semibold mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                      placeholder="House/Flat no., Street name"
                      required={orderType === 'DELIVERY'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">City</label>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">Pincode</label>
                      <input
                        type="text"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.landmark}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                      placeholder="Near..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Notes */}
            <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 poppins-semibold mb-4">
                Payment & Notes
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="ONLINE">Paid Online</option>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 poppins-regular"
                    rows="3"
                    placeholder="Any special requests..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 poppins-semibold mb-4">Order Summary</h2>
              
              {/* Selected Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-sm poppins-regular text-center py-4">No items added</p>
                ) : (
                  selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-stone-50 rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium poppins-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 poppins-regular">₹{item.price} × {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-stone-300 rounded text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-stone-300 rounded text-sm"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-stone-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm poppins-regular">
                  <span>Items Total</span>
                  <span>₹{totals.itemsTotal.toFixed(2)}</span>
                </div>
                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-sm poppins-regular">
                    <span>Delivery Fee</span>
                    <span>₹{totals.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm poppins-regular">
                  <span>Tax ({totals.taxRate}%)</span>
                  <span>₹{totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold poppins-bold border-t border-stone-200 pt-2">
                  <span>Total</span>
                  <span className="text-red-500">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium poppins-medium"
                >
                  ← Back to Items
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedItems.length === 0}
                  className="flex-1 bg-red-400 text-white py-3 rounded-lg hover:bg-red-500 transition-colors font-medium poppins-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
        )}

        {/* Variant Selection Modal */}
        {showVariantModal && selectedMenuItem && (
          <div className="fixed inset-0 bg-gray-900/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 poppins-bold">
                  Select Size
                </h3>
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Item Info */}
              <div className="mb-6">
                <div className="flex gap-4">
                  {selectedMenuItem.image && (
                    <img
                      src={selectedMenuItem.image}
                      alt={selectedMenuItem.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Ctext x="50%25" y="50%25" font-size="40" text-anchor="middle" dy=".3em"%3E🍽️%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 poppins-bold">{selectedMenuItem.name}</h4>
                    <p className="text-sm text-gray-500 poppins-regular">
                      {selectedMenuItem.categories?.[0] || 'Uncategorized'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant Options */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700 poppins-medium mb-2">
                  Choose your size:
                </label>
                {selectedMenuItem.priceVariants?.map((variant, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      selectedVariant === variant
                        ? 'border-red-400 bg-red-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedVariant === variant
                          ? 'border-red-400'
                          : 'border-gray-300'
                      }`}>
                        {selectedVariant === variant && (
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 poppins-medium">
                        {variant.quantity}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-red-500 poppins-bold">
                      ₹{variant.price}
                    </span>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowVariantModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors poppins-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="flex-1 px-4 py-3 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors poppins-medium shadow-md"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
