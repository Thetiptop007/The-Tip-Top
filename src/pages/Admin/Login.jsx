import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Call backend API for authentication
      const response = await fetch(getApiUrl('api/v1/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      console.log('🔐 Login response:', { status: response.status, success: data.status === 'success' });
      console.log('📦 Response data structure:', {
        hasUser: !!data.data?.user,
        userRole: data.data?.user?.role,
        hasTokens: !!data.data?.tokens,
        hasAccessToken: !!data.data?.tokens?.accessToken
      });

      if (response.ok && data.status === 'success') {
        // Check if user is admin
        if (data.data.user.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Store auth token in localStorage
        const token = data.data.tokens.accessToken;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminEmail', data.data.user.email?.address || data.data.user.email);
        localStorage.setItem('adminName', `${data.data.user.name.first} ${data.data.user.name.last}`);
        
        console.log('✅ Token stored:', token.substring(0, 20) + '...');
        console.log('✅ Redirecting to dashboard...');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setError(data.message || 'Invalid email or password');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Fallback to demo login if backend is not available
      if (email === 'admin@thetiptop.com' && password === 'admin123') {
        localStorage.setItem('adminToken', 'demo-token');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminName', 'Demo Admin');
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setError('Cannot connect to server. Use demo credentials: admin@thetiptop.com / admin123');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-400 rounded-full mb-4">
            <span className="text-white text-2xl font-bold sigmar-regular">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sigmar-regular">The Tip Top</h1>
          <p className="text-gray-600 mt-2 poppins-regular">Admin Panel Login</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg border border-stone-200 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thetiptop.com"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent poppins-regular"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 poppins-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent poppins-regular"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg poppins-regular">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-400 text-white py-3 rounded-lg hover:bg-red-500 transition-colors font-medium poppins-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <p className="text-sm text-gray-600 mb-2 poppins-semibold">Demo Credentials:</p>
            <p className="text-xs text-gray-500 poppins-regular">Email: admin@thetiptop.com</p>
            <p className="text-xs text-gray-500 poppins-regular">Password: admin123</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-red-400 transition-colors poppins-regular"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
