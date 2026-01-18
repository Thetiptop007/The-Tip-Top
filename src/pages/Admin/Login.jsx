import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent poppins-regular"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M15.171 13.576l1.414 1.414A10.027 10.027 0 0019.542 10c-1.274-4.057-5.064-7-9.542-7a9.972 9.972 0 00-3.516.638l2.107 2.107A6 6 0 0115.171 13.576z" />
                    </svg>
                  )}
                </button>
              </div>
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
