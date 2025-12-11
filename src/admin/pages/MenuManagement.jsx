import { useState, useEffect } from 'react';
import Pagination from '../components/ui/Pagination';
import { menuEndpoints } from '../services/api/endpoints/menu';
import { categoryEndpoints } from '../services/api/endpoints/categories';

export default function MenuManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 12;

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    image: '',
    categories: [],
    isAvailable: true,
    priceVariants: [
      { quantity: 'Quarter', price: '' },
      { quantity: 'Half', price: '' },
      { quantity: 'Full', price: '' },
      { quantity: '2PCS', price: '' },
      { quantity: '4PCS', price: '' },
      { quantity: '8PCS', price: '' },
      { quantity: '16PCS', price: '' },
    ],
  });

  // Fetch menu items and categories on mount
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchMenuItems();
      }
    }, 400); // 400ms debounce for smooth search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchMenuItems();
  }, [currentPage, categoryFilter, availabilityFilter]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: '-createdAt',
      };

      console.log('=== FETCH MENU ITEMS DEBUG ===');
      console.log('Search Query:', searchQuery);
      console.log('Search Query Trimmed:', searchQuery.trim());
      console.log('Search Query Length:', searchQuery.length);

      // Fuzzy search - backend will handle typo tolerance
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
        params.fuzzy = 'true'; // Enable fuzzy search on backend
        console.log('Search params added:', { search: params.search, fuzzy: params.fuzzy });
      }

      if (categoryFilter !== 'ALL') {
        params.categories = categoryFilter;
        console.log('Category filter:', categoryFilter);
      }
      if (availabilityFilter !== 'ALL') {
        params.isAvailable = availabilityFilter === 'AVAILABLE';
        console.log('Availability filter:', params.isAvailable);
      }

      console.log('Final params being sent to API:', params);

      console.log('🔍 Fetching menu items with params:', params);

      const response = await menuEndpoints.getAll(params);
      
      console.log('=== DETAILED API RESPONSE DEBUG ===');
      console.log('✅ Full API Response:', response);
      console.log('Response Type:', typeof response);
      console.log('Response Keys:', Object.keys(response));
      console.log('Response.data:', response.data);
      console.log('Response.data type:', typeof response.data);
      
      if (response.data) {
        console.log('Response.data keys:', Object.keys(response.data));
        console.log('Response.data.menuItems:', response.data.menuItems);
        console.log('Response.data.data:', response.data.data);
      }
      
      console.log('📊 Response structure:', {
        hasData: !!response.data,
        hasMenuItems: !!response.data?.menuItems,
        hasPagination: !!response.pagination,
        itemCount: response.data?.menuItems?.length
      });
      
      const items = response.data.menuItems || response.data?.data?.menuItems || [];
      console.log('Extracted items:', items);
      console.log('Items count:', items.length);
      
      if (items.length === 0) {
        console.error('❌ NO ITEMS FOUND!');
        console.error('Search Query was:', searchQuery);
        console.error('Params sent:', params);
        console.error('Check if backend is returning results');
      } else {
        console.log('✅ Found', items.length, 'items');
        console.log('Sample item:', items[0]);
      }
      
      setMenuItems(items);
      
      // Set pagination data from backend
      const pagination = response.pagination || response.data?.pagination;
      console.log('Pagination:', pagination);
      
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || 0);
        console.log('Set pages:', pagination.totalPages, 'total:', pagination.totalItems);
      }
      
      console.log('=== END API RESPONSE DEBUG ===');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryEndpoints.getAll({ limit: 100 });
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 Fetching menu stats...');
      
      // Fetch total counts for stats
      const [allResponse, availableResponse, unavailableResponse] = await Promise.all([
        menuEndpoints.getAll({ limit: 1, page: 1 }),
        menuEndpoints.getAll({ limit: 1, page: 1, isAvailable: true }),
        menuEndpoints.getAll({ limit: 1, page: 1, isAvailable: false }),
      ]);
      
      console.log('📊 Menu API responses:', {
        all: allResponse.pagination,
        available: availableResponse.pagination,
        unavailable: unavailableResponse.pagination
      });
      
      const calculatedStats = {
        total: allResponse.pagination?.totalItems || 0,
        available: availableResponse.pagination?.totalItems || 0,
        unavailable: unavailableResponse.pagination?.totalItems || 0,
      };
      
      console.log('✅ Calculated menu stats:', calculatedStats);
      
      setStats(calculatedStats);
    } catch (err) {
      console.error('❌ Error fetching menu stats:', err);
      console.error('Error details:', err.response?.data || err.message);
    }
  };

  // Search filtering happens on backend now, no need for local filtering
  const displayItems = menuItems;

  // Cloudinary upload function
  const handleImageUpload = async (file, isEdit = false) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'menu_items'); // Replace with your upload preset
      formData.append('cloud_name', 'your_cloud_name'); // Replace with your cloud name

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', // Replace with your cloud name
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        if (isEdit) {
          setSelectedItem({ ...selectedItem, image: data.secure_url });
          setEditImagePreview(data.secure_url);
        } else {
          setNewItem({ ...newItem, image: data.secure_url });
          setImagePreview(data.secure_url);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Page reset happens in debounced effect
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...newItem.priceVariants];
    updatedVariants[index][field] = value;
    setNewItem({ ...newItem, priceVariants: updatedVariants });
  };

  const handleEditVariantChange = (index, field, value) => {
    const updatedVariants = [...(selectedItem.priceVariants || [])];
    if (!updatedVariants[index]) {
      updatedVariants[index] = { quantity: '', price: '' };
    }
    updatedVariants[index][field] = value;
    setSelectedItem({ ...selectedItem, priceVariants: updatedVariants });
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || newItem.categories.length === 0) {
      alert('Please fill in all required fields (name and at least one category)');
      return;
    }

    // Filter out empty variants
    const validVariants = newItem.priceVariants.filter(v => v.price && parseFloat(v.price) > 0);
    
    if (validVariants.length === 0) {
      alert('Please add at least one price variant');
      return;
    }

    try {
      const itemData = {
        name: newItem.name,
        description: newItem.description,
        image: newItem.image,
        categories: newItem.categories,
        priceVariants: validVariants,
        isAvailable: newItem.isAvailable,
      };
      console.log('Creating menu item:', itemData);
      await menuEndpoints.create(itemData);
      setNewItem({ 
        name: '', 
        description: '', 
        image: '',
        categories: [], 
        isAvailable: true,
        priceVariants: [
          { quantity: 'Quarter', price: '' },
          { quantity: 'Half', price: '' },
          { quantity: 'Full', price: '' },
          { quantity: '2PCS', price: '' },
          { quantity: '4PCS', price: '' },
          { quantity: '8PCS', price: '' },
          { quantity: '16PCS', price: '' },
        ],
      });
      setShowAddModal(false);
      alert('Menu item added successfully!');
      fetchMenuItems();
      fetchStats();
    } catch (err) {
      console.error('Error adding menu item:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add menu item';
      if (err.response?.status === 401) {
        alert('⚠️ Authentication required! Please login as admin first.');
      } else {
        alert('❌ ' + errorMsg);
      }
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem.name.trim() || !selectedItem.categories || selectedItem.categories.length === 0) {
      alert('Please fill in all required fields (name and at least one category)');
      return;
    }

    // Filter out empty variants
    const validVariants = (selectedItem.priceVariants || []).filter(v => v.price && parseFloat(v.price) > 0);

    if (validVariants.length === 0) {
      alert('Please add at least one price variant');
      return;
    }

    try {
      const itemData = {
        name: selectedItem.name,
        description: selectedItem.description,
        image: selectedItem.image,
        categories: selectedItem.categories,
        priceVariants: validVariants,
        isAvailable: selectedItem.isAvailable,
      };
      console.log('Updating menu item:', itemData);
      const itemId = selectedItem._id || selectedItem.id;
      await menuEndpoints.update(itemId, itemData);
      setShowEditModal(false);
      setSelectedItem(null);
      alert('Menu item updated successfully!');
      fetchMenuItems();
      fetchStats();
    } catch (err) {
      console.error('Error updating menu item:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update menu item';
      if (err.response?.status === 401) {
        alert('⚠️ Authentication required! Please login as admin first.');
      } else {
        alert('❌ ' + errorMsg);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuEndpoints.delete(id);
        alert('Menu item deleted successfully!');
        fetchMenuItems();
        fetchStats();
      } catch (err) {
        console.error('Error deleting menu item:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to delete menu item';
        if (err.response?.status === 401) {
          alert('⚠️ Authentication required! Please login as admin first.');
        } else {
          alert('❌ ' + errorMsg);
        }
      }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await menuEndpoints.updateAvailability(id, !currentStatus);
      fetchMenuItems();
      fetchStats();
      alert('Availability updated successfully!');
    } catch (err) {
      console.error('Error toggling availability:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update availability';
      if (err.response?.status === 401) {
        alert('⚠️ Authentication required! Please login as admin first.');
      } else {
        alert('❌ ' + errorMsg);
      }
    }
  };

  const openEditModal = (item) => {
    // Ensure priceVariants array exists with all quantity options
    const existingVariants = item.priceVariants || [];
    const quantities = ['Quarter', 'Half', 'Full', '2PCS', '4PCS', '8PCS', '16PCS'];
    
    const fullVariants = quantities.map(qty => {
      const existing = existingVariants.find(v => v.quantity === qty);
      return existing || { quantity: qty, price: '' };
    });
    
    const itemWithVariants = {
      ...item,
      categories: item.categories || [],
      priceVariants: fullVariants,
    };
    setSelectedItem(itemWithVariants);
    setEditImagePreview(item.image || '');
    setShowEditModal(true);
  };

  const handleCategoryToggle = (categoryName, isEdit = false) => {
    if (isEdit) {
      const currentCategories = selectedItem.categories || [];
      const newCategories = currentCategories.includes(categoryName)
        ? currentCategories.filter(cat => cat !== categoryName)
        : [...currentCategories, categoryName];
      setSelectedItem({ ...selectedItem, categories: newCategories });
    } else {
      const currentCategories = newItem.categories || [];
      const newCategories = currentCategories.includes(categoryName)
        ? currentCategories.filter(cat => cat !== categoryName)
        : [...currentCategories, categoryName];
      setNewItem({ ...newItem, categories: newCategories });
    }
  };

  const openAddModal = () => {
    setImagePreview('');
    setNewItem({
      name: '',
      description: '',
      image: '',
      categories: [],
      isAvailable: true,
      priceVariants: [
        { quantity: 'Quarter', price: '' },
        { quantity: 'Half', price: '' },
        { quantity: 'Full', price: '' },
        { quantity: '2PCS', price: '' },
        { quantity: '4PCS', price: '' },
        { quantity: '8PCS', price: '' },
        { quantity: '16PCS', price: '' },
      ],
    });
    setShowAddModal(true);
  };

  console.log('Current state:', { loading, menuItems: menuItems.length, totalPages, totalItems, displayItems: displayItems.length });

  if (loading && menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Menu Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Items</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">All menu items</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Available</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.available}</p>
          <p className="text-xs text-gray-500 mt-1">Currently available</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Unavailable</span>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-600">{stats.unavailable}</p>
          <p className="text-xs text-gray-500 mt-1">Out of stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Items</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
            {/* Image */}
            {item.image && (
              <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  item.isAvailable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="mb-4">
                {item.priceVariants && item.priceVariants.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500 block mb-1">Price Variants:</span>
                    {item.priceVariants.map((variant, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{variant.quantity}</span>
                        <span className="font-semibold text-red-600">₹{variant.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xl font-bold text-red-600">No price variants</span>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.categories && item.categories.map((cat, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    item.isAvailable
                      ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      : 'text-green-700 bg-green-100 hover:bg-green-200'
                  }`}
                >
                  {item.isAvailable ? 'Disable' : 'Enable'}
                </button>
              </div>

              <button
                onClick={() => handleDeleteItem(item._id)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayItems.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 text-lg">No menu items found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-[100000]">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Menu Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0], false)}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setNewItem({ ...newItem, image: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    value={newItem.image}
                    onChange={(e) => {
                      setNewItem({ ...newItem, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Or paste image URL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories * (select multiple)</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {categories.filter(cat => cat.isActive).map((cat) => (
                    <label key={cat._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={newItem.categories.includes(cat.name)}
                        onChange={() => handleCategoryToggle(cat.name, false)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Selected: {newItem.categories.length} categories</p>
              </div>

              {/* Price Variants Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Variants *</label>
                <div className="space-y-3">
                  {newItem.priceVariants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{variant.quantity}</label>
                        <input
                          type="text"
                          value={variant.quantity}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          placeholder="Enter price"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">* Add at least one price variant</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={newItem.isAvailable}
                  onChange={(e) => setNewItem({ ...newItem, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                  Mark as Available
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-[100000]">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Menu Item</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0], true)}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {editImagePreview && (
                    <div className="relative">
                      <img src={editImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditImagePreview('');
                          setSelectedItem({ ...selectedItem, image: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    value={selectedItem.image || ''}
                    onChange={(e) => {
                      setSelectedItem({ ...selectedItem, image: e.target.value });
                      setEditImagePreview(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Or paste image URL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={selectedItem.description || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories * (select multiple)</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {categories.filter(cat => cat.isActive).map((cat) => (
                    <label key={cat._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={(selectedItem.categories || []).includes(cat.name)}
                        onChange={() => handleCategoryToggle(cat.name, true)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Selected: {(selectedItem.categories || []).length} categories</p>
              </div>

              {/* Price Variants Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Variants *</label>
                <div className="space-y-3">
                  {(selectedItem.priceVariants || []).map((variant, index) => (
                    <div key={index} className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{variant.quantity}</label>
                        <input
                          type="text"
                          value={variant.quantity}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleEditVariantChange(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          placeholder="Enter price"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">* Add at least one price variant</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailableEdit"
                  checked={selectedItem.isAvailable}
                  onChange={(e) => setSelectedItem({ ...selectedItem, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isAvailableEdit" className="text-sm font-medium text-gray-700">
                  Mark as Available
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
