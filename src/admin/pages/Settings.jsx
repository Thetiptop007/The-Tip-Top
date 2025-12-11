import { useState, useEffect } from 'react';
import { settingsAPI } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      const data = response.data.data.settings;
      setSettings({
        siteName: data.siteName || 'ThéTipTop',
        contactEmail: data.contactEmail || 'contact@thetiptop.com',
        contactPhone: data.contactPhone || '+33 1 23 45 67 89',
        businessAddress: data.businessAddress || '123 Restaurant Street, Paris, France',
        website: data.website || 'www.thetiptop.com',
        notificationEmails: data.notificationEmails?.length > 0 ? data.notificationEmails : [''],
        minimumOrderAmount: data.minimumOrderAmount || 0,
        taxRate: data.taxRate || 0,
        deliveryCharge: data.deliveryCharge || 0,
        upiId: data.upiId || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set default values if fetch fails
      setSettings({
        siteName: 'ThéTipTop',
        contactEmail: 'contact@thetiptop.com',
        contactPhone: '+33 1 23 45 67 89',
        businessAddress: '123 Restaurant Street, Paris, France',
        website: 'www.thetiptop.com',
        notificationEmails: [''],
        minimumOrderAmount: 0,
        taxRate: 0,
        deliveryCharge: 0,
        upiId: '',
      });
      alert('Failed to load settings from server. Using default values. Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Filter out empty emails
      const filteredEmails = settings.notificationEmails.filter(email => email.trim() !== '');
      
      // Validate emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = filteredEmails.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        alert(`Invalid email addresses: ${invalidEmails.join(', ')}`);
        setSaving(false);
        return;
      }
      
      await settingsAPI.update({
        ...settings,
        notificationEmails: filteredEmails,
      });
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addEmail = () => {
    setSettings({
      ...settings,
      notificationEmails: [...settings.notificationEmails, ''],
    });
  };

  const removeEmail = (index) => {
    setSettings({
      ...settings,
      notificationEmails: settings.notificationEmails.filter((_, i) => i !== index),
    });
  };

  const updateEmail = (index, value) => {
    const updated = [...settings.notificationEmails];
    updated[index] = value;
    setSettings({
      ...settings,
      notificationEmails: updated,
    });
  };

  const handleInputChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Settings
      </h1>

      <div className="grid grid-cols-1 gap-6">
        {/* General Settings */}
        <div className="bg-white  rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900  mb-4">
            General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Address
              </label>
              <textarea
                value={settings.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="123 Restaurant Street, Paris, France"
              />
              <p className="text-xs text-gray-500 mt-1">
                This address will be displayed in the mobile app's Help & Support section
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="www.thetiptop.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Website URL (with or without https://)
              </p>
            </div>
          </div>
        </div>

        {/* Order Configuration */}
        <div className="bg-white  rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900  mb-4">
            Order Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notification Email Addresses
                </label>
                <button
                  onClick={addEmail}
                  type="button"
                  className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  + Add Email
                </button>
              </div>
              <div className="space-y-2">
                {settings.notificationEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    {settings.notificationEmails.length > 1 && (
                      <button
                        onClick={() => removeEmail(index)}
                        type="button"
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                These email addresses will receive notifications for new orders
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                value={settings.minimumOrderAmount}
                onChange={(e) => handleInputChange('minimumOrderAmount', parseFloat(e.target.value) || 0)}
                min="0"
                step="10"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum order value required for checkout
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tax percentage applied to orders
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={settings.deliveryCharge}
                onChange={(e) => handleInputChange('deliveryCharge', parseFloat(e.target.value) || 0)}
                min="0"
                step="5"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Standard delivery charge for orders
              </p>
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="bg-white  rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900  mb-4">
            Payment Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                placeholder="yourname@bank"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                UPI ID for collecting COD payments from customers via QR code
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white  rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900  mb-4">
            Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Change Password
              </label>
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={fetchSettings}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
