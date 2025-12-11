import { useState, useEffect } from 'react';
import Pagination from '../components/ui/Pagination';
import { categoryEndpoints } from '../services/api/endpoints/categories';

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalItems: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Fetch categories on mount and when page changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryEndpoints.getAll({
        page: currentPage,
        limit: itemsPerPage,
        sort: '-createdAt',
      });
      // Transform backend data to match frontend expectations
      const transformedCategories = response.data.categories.map(cat => ({
        ...cat,
        id: cat._id,
        createdDate: new Date(cat.createdAt).toISOString().split('T')[0]
      }));
      setCategories(transformedCategories);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await categoryEndpoints.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      console.log('Creating category:', newCategory);
      const token = localStorage.getItem('adminToken');
      console.log('Admin token present:', !!token);
      
      const response = await categoryEndpoints.create(newCategory);
      console.log('Create response:', response);
      
      setNewCategory({ name: '', description: '', isActive: true });
      setShowAddModal(false);
      alert('Category added successfully!');
      fetchCategories();
      fetchStats();
    } catch (err) {
      console.error('Error adding category:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add category';
      
      if (err.response?.status === 401) {
        alert('⚠️ Authentication required! Please login as admin first.\n\nError: ' + errorMsg);
      } else {
        alert('❌ ' + errorMsg);
      }
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory.name.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      console.log('Updating category:', selectedCategory);
      const categoryId = selectedCategory._id || selectedCategory.id;
      console.log('Category ID:', categoryId);
      
      const response = await categoryEndpoints.update(categoryId, {
        name: selectedCategory.name,
        description: selectedCategory.description,
        isActive: selectedCategory.isActive,
        color: selectedCategory.color,
      });
      console.log('Update response:', response);
      
      setShowEditModal(false);
      setSelectedCategory(null);
      alert('Category updated successfully!');
      fetchCategories();
      fetchStats();
    } catch (err) {
      console.error('Error updating category:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update category';
      
      if (err.response?.status === 401) {
        alert('⚠️ Authentication required! Please login as admin first.\n\nError: ' + errorMsg);
      } else {
        alert('❌ ' + errorMsg);
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        console.log('Deleting category:', id);
        const response = await categoryEndpoints.delete(id);
        console.log('Delete response:', response);
        alert('Category deleted successfully!');
        fetchCategories();
        fetchStats();
      } catch (err) {
        console.error('Error deleting category:', err);
        console.error('Error response:', err.response);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to delete category';
        
        if (err.response?.status === 401) {
          alert('⚠️ Authentication required! Please login as admin first.\n\nError: ' + errorMsg);
        } else {
          alert('❌ ' + errorMsg);
        }
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      console.log('Toggling status for category:', id);
      const response = await categoryEndpoints.toggleStatus(id);
      console.log('Toggle response:', response);
      fetchCategories();
      fetchStats();
      alert('Category status updated successfully!');
    } catch (err) {
      console.error('Error toggling status:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to toggle category status';
      
      if (err.response?.status === 401) {
        alert('⚠️ Authentication required! Please login as admin first.\n\nError: ' + errorMsg);
      } else {
        alert('❌ ' + errorMsg);
      }
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory({ ...category });
    setShowEditModal(true);
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[color] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage menu categories and organize items</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Categories</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">All categories</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Active Categories</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-500 mt-1">Currently active</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Inactive Categories</span>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
          <p className="text-xs text-gray-500 mt-1">Disabled categories</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Menu Items</span>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">Across all categories</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
            {/* Header with gradient */}
            <div className={`relative h-24 ${
              category.isActive 
                ? 'bg-gradient-to-br from-red-400 to-red-600' 
                : 'bg-gradient-to-br from-gray-300 to-gray-500'
            }`}>
              <div className="relative h-full flex items-center justify-between px-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white bg-opacity-25 backdrop-blur-sm border border-white border-opacity-40">
                      {category.itemCount} items
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-white drop-shadow">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{category.description}</p>

              {/* Meta Info */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">Created: {category.createdDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(category.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md ${
                    category.isActive
                      ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      : 'text-green-700 bg-green-100 hover:bg-green-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.isActive ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                  </svg>
                  {category.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
              
              {/* Delete Button - Full Width */}
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Category
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-gray-500 text-lg">No categories found</p>
        </div>
      )}

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-400/70 flex items-center justify-center p-4 z-[100000]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Category</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter category description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newCategory.isActive}
                  onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Set as Active
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-[100000]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Category</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter category description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={selectedCategory.isActive}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, isActive: e.target.checked })}
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700">
                  Set as Active
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
