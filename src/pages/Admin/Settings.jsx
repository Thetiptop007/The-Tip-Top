import { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';

function Settings() {
  const [settings, setSettings] = useState({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    website: '',
    notificationEmails: [],
    minimumOrderAmount: 0,
    taxRate: 0,
    deliveryCharge: 0,
    upiId: '',
  });
  
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('api/v1/settings'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEmail = () => {
    if (notificationEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
      if (!settings.notificationEmails.includes(notificationEmail)) {
        setSettings(prev => ({
          ...prev,
          notificationEmails: [...prev.notificationEmails, notificationEmail],
        }));
        setNotificationEmail('');
      }
    } else {
      alert('Please enter a valid email address');
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setSettings(prev => ({
      ...prev,
      notificationEmails: prev.notificationEmails.filter(email => email !== emailToRemove),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('api/v1/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      }));

      const data = await response.json();

      if (data.success) {
        alert('Settings updated successfully!');
        fetchSettings();
      } else {
        alert(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your restaurant and app settings</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="ThéTipTop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="contact@restaurant.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={settings.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="www.restaurant.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <input
                type="text"
                name="businessAddress"
                value={settings.businessAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="123 Restaurant Street, City, Country"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Emails</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add email addresses that will receive order notifications
          </p>
          
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="admin@restaurant.com"
            />
            <button
              onClick={handleAddEmail}
              className="px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {settings.notificationEmails.map((email, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-gray-700">{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {settings.notificationEmails.length === 0 && (
              <p className="text-gray-400 text-sm italic">No notification emails added</p>
            )}
          </div>
        </div>

        {/* Order & Pricing Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order & Pricing Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Amount ($)
              </label>
              <input
                type="number"
                name="minimumOrderAmount"
                value={settings.minimumOrderAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum amount required to place an order</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Applied to all orders</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Charge ($)
              </label>
              <input
                type="number"
                name="deliveryCharge"
                value={settings.deliveryCharge}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Standard delivery fee</p>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Configuration</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID (for online payments)
            </label>
            <input
              type="text"
              name="upiId"
              value={settings.upiId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="restaurant@upi"
            />
            <p className="text-xs text-gray-500 mt-1">UPI ID for collecting online payments</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-3 bg-red-400 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
