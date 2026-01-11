import { useEffect, useState, useRef } from 'react';

const MenuItems = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    priceVariants: [{ quantity: 'Full', price: '' }],
    categories: [],
    isAvailable: true,
    rating: 4.0
  });
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [categories, setCategories] = useState(['All']);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, available: 0, unavailable: 0 });

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const abortRef = useRef(null);

  // fetch categories
  useEffect(() => {
    let mounted = true;
    fetch('/api/v1/menu/categories/all')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data && data.data && Array.isArray(data.data.categories)) {
          setCategories(['All', ...data.data.categories]);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // fetch overall stats from backend stats endpoint
  useEffect(() => {
    let mounted = true;
    fetch('/api/v1/menu/stats/overview')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data && data.data && data.data.overview) {
          const overview = data.data.overview;
          setStats({
            total: overview.totalItems || 0,
            available: overview.availableItems || 0,
            unavailable: (overview.totalItems || 0) - (overview.availableItems || 0)
          });
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 450);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // fetch menu items when filters change
  useEffect(() => {
    // cancel previous
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('limit', limit);
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);

        const res = await fetch(`/api/v1/menu?${params.toString()}`, { signal: controller.signal });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        if (json && json.data) {
          setMenuItems(json.data.menuItems || []);
          setTotalItems(json.pagination?.totalItems || 0);
          setTotalPages(json.pagination?.totalPages || 1);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('Failed to load menu items. Please ensure the backend server is running.');
        }
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [page, limit, debouncedSearch, selectedCategory]);

  // Add new menu item
  const handleAddItem = async () => {
    if (!formData.name || !formData.image || !formData.priceVariants.length || !selectedCategories.length) {
      alert('Please fill all required fields');
      return;
    }

    // Validate price variants
    const validVariants = formData.priceVariants.filter(v => v.quantity && v.price > 0);
    if (validVariants.length === 0) {
      alert('Please add at least one valid price variant');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        priceVariants: validVariants,
        categories: selectedCategories,
        isAvailable: formData.isAvailable,
        rating: parseFloat(formData.rating) || 4.0
      };

      const res = await fetch('/api/v1/menu', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        // Extract user-friendly error message
        let errorMsg = 'Failed to create item';
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          // Extract detailed validation errors
          errorMsg = error.errors.map(e => {
            if (typeof e === 'string') return e;
            if (e.message) return e.message;
            if (e.msg) return e.msg;
            if (e.path && e.type) return `${e.path}: ${e.type}`;
            return JSON.stringify(e);
          }).join('\n');
        } else if (error.message) {
          errorMsg = error.message;
        } else if (error.error) {
          errorMsg = error.error;
        }
        alert(`Create Error:\n\n${errorMsg}`);
        return;
      }

      const result = await res.json();
      alert('Menu item added successfully!');
      setShowAddModal(false);
      resetForm();
      setPage(1); // Refresh list
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Edit existing menu item
  const handleEditItem = async () => {
    if (!editingItem || !formData.name || !formData.image || !formData.priceVariants.length || !selectedCategories.length) {
      alert('Please fill all required fields');
      return;
    }

    const validVariants = formData.priceVariants.filter(v => v.quantity && v.price > 0);
    if (validVariants.length === 0) {
      alert('Please add at least one valid price variant');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        priceVariants: validVariants,
        categories: selectedCategories,
        isAvailable: formData.isAvailable,
        rating: parseFloat(formData.rating) || 4.0
      };

      const res = await fetch(`/api/v1/menu/${editingItem._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        // Extract user-friendly error message
        let errorMsg = 'Failed to update item';
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          // Extract detailed validation errors
          errorMsg = error.errors.map(e => {
            if (typeof e === 'string') return e;
            if (e.message) return e.message;
            if (e.msg) return e.msg;
            if (e.path && e.type) return `${e.path}: ${e.type}`;
            return JSON.stringify(e);
          }).join('\n');
        } else if (error.message) {
          errorMsg = error.message;
        } else if (error.error) {
          errorMsg = error.error;
        }
        alert(`Update Error:\n\n${errorMsg}`);
        return;
      }

      const result = await res.json();
      alert('Menu item updated successfully!');
      setShowAddModal(false);
      resetForm();
      setPage(1); // Refresh list
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSubmit = () => {
    if (editingItem) {
      handleEditItem();
    } else {
      handleAddItem();
    }
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      fetch(`/api/v1/menu/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
        .then((res) => res.json())
        .then(() => {
          setPage(1);
        })
        .catch(() => {});
    }
  };

  const toggleAvailability = (id, current) => {
    const payload = { isAvailable: !current };
    
    fetch(`/api/v1/menu/${id}/availability`, { 
      method: 'PATCH', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }, 
      body: JSON.stringify(payload) 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== 'success') {
          alert('Failed to toggle availability: ' + (data.message || 'Unknown error'));
        } else {
          setPage(1);
        }
      })
      .catch((err) => {
        alert('Error toggling availability: ' + err.message);
      });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      image: item.image,
      priceVariants: item.priceVariants || [{ quantity: 'Full', price: '' }],
      categories: item.categories || [],
      isAvailable: item.isAvailable,
      rating: parseFloat(item.rating) || 4.0
    });
    setSelectedCategories(item.categories || []);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      priceVariants: [{ quantity: 'Full', price: '' }],
      categories: [],
      isAvailable: true,
      rating: 4.0
    });
    setSelectedCategories([]);
    setEditingItem(null);
  };

  // Add/remove price variant
  const addPriceVariant = () => {
    setFormData({
      ...formData,
      priceVariants: [...formData.priceVariants, { quantity: 'Full', price: '' }]
    });
  };

  const removePriceVariant = (index) => {
    if (formData.priceVariants.length > 1) {
      const updated = formData.priceVariants.filter((_, i) => i !== index);
      setFormData({ ...formData, priceVariants: updated });
    }
  };

  const updatePriceVariant = (index, field, value) => {
    const updated = [...formData.priceVariants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, priceVariants: updated });
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 poppins-bold">Menu Items</h1>
          <p className="mt-2 text-gray-600 poppins-regular">Manage your restaurant menu items and categories</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2 poppins-medium shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-stone-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300  rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent  "
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-red-400 text-white'
                    : 'bg-stone-100  text-gray-700  hover:bg-gray-200 '
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-4">
          <p className="text-sm text-gray-600 ">Total Items</p>
          <p className="text-2xl font-bold text-gray-900 ">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-4">
          <p className="text-sm text-gray-600 ">Available</p>
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-4">
          <p className="text-sm text-gray-600 ">Unavailable</p>
          <p className="text-2xl font-bold text-red-600">{stats.unavailable}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-4">
          <p className="text-sm text-gray-600 ">Categories</p>
          <p className="text-2xl font-bold text-blue-600">{categories.length - 1}</p>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-6 text-center">Loading...</div>
        ) : (
          menuItems.map((item) => (
            <div key={item._id || item.id} className="bg-white rounded-lg shadow-md border border-stone-200 hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-6xl">🍽️</span>'; }} />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                {item.isVeg ? (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">VEG</span>
                ) : (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">NON-VEG</span>
                )}
                {!item.isAvailable && (
                  <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900  line-clamp-1">{item.name}</h3>
                <span className="text-xs text-gray-500 ">{item.categories?.[0] || 'Uncategorized'}</span>
              </div>
              
              <p className="text-sm text-gray-600  line-clamp-2 mb-3">{item.description}</p>
              
              {/* Price Variants */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.priceVariants?.map((variant, idx) => (
                    <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                      {variant.quantity}: ₹{variant.price}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-red-500">₹{item.priceVariants?.[0]?.price || 'N/A'}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-700 ">{item.rating?.toFixed(1) || '4.0'}</span>
                    <span className="text-gray-400">({item.reviews || 0})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500  mb-3">
                <span className="text-gray-600">{item.stats?.totalOrders || 0} orders</span>
                <span className="text-gray-600">₹{item.stats?.totalRevenue?.toFixed(0) || 0} revenue</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleAvailability(item._id || item.id, item.isAvailable)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.isAvailable 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200  ' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200  '
                  }`}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200   transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteItem(item._id || item.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200   transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {(!loading && menuItems.length === 0) && (
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900  mb-2">No Menu Items Found</h3>
          <p className="text-gray-600  mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-200  p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 ">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 ">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  placeholder="Brief description of the item..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Variants *</label>
                {formData.priceVariants.map((variant, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={variant.quantity}
                      onChange={(e) => updatePriceVariant(index, 'quantity', e.target.value)}
                      className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    >
                      <option value="Quarter">Quarter</option>
                      <option value="Half">Half</option>
                      <option value="Full">Full</option>
                      <option value="2PCS">2 PCS</option>
                      <option value="4PCS">4 PCS</option>
                      <option value="8PCS">8 PCS</option>
                      <option value="16PCS">16 PCS</option>
                    </select>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updatePriceVariant(index, 'price', parseFloat(e.target.value))}
                      className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="Price (₹)"
                    />
                    {formData.priceVariants.length > 1 && (
                      <button
                        onClick={() => removePriceVariant(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPriceVariant}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  + Add Price Variant
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories * (Select multiple)</label>
                <div className="flex flex-wrap gap-2 p-3 border border-stone-300 rounded-lg max-h-40 overflow-y-auto">
                  {categories.filter(c => c !== 'All').map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-red-400 text-white'
                          : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Selected: {selectedCategories.join(', ')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, rating: isNaN(val) ? 4.0 : val });
                    }}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    placeholder="4.0"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-red-400 border-stone-300 rounded focus:ring-red-400"
                    />
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">Showing page {page} of {totalPages} — {totalItems} items</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 bg-stone-100 rounded-md">Prev</button>
          {/* simple page numbers */}
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const displayStart = Math.max(1, page - 3);
            const pNum = displayStart + i;
            if (pNum > totalPages) return null;
            return (
              <button key={pNum} onClick={() => setPage(pNum)} className={`px-3 py-2 rounded-md ${pNum === page ? 'bg-red-400 text-white' : 'bg-stone-100'}`}>{pNum}</button>
            );
          })}
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 bg-stone-100 rounded-md">Next</button>
          <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }} className="ml-2 px-2 py-1 border rounded-md">
            {[6,12,24,48].map(n => (<option key={n} value={n}>{n} / page</option>))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MenuItems;
