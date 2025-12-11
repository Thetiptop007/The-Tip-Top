import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../api";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.login({ email, password });
      const result = response.data; // Extract data from axios response
      
      if (result.status === 'success' && result.data) {
        const { user, tokens } = result.data;
        const { accessToken, refreshToken } = tokens;
        
        // Check if user is admin
        if (user.role === 'admin') {
          const userName = user.name?.first 
            ? `${user.name.first} ${user.name.last || ''}`.trim()
            : user.name || 'Admin';
          
          login(user, accessToken, refreshToken);
          toast.success(`Welcome back, ${userName}!`);
          navigate("/admin/dashboard");
        } else {
          setError("Access denied. Admin role required.");
          toast.error("Access denied. Admin privileges required.");
        }
      } else {
        setError(result.message || "Login failed");
        toast.error(result.message || "Login failed");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Admin Portal
            </h2>
            <p className="text-gray-600 mt-2">
              Sign in to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-red-600 hover:text-red-500"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: <br />
              <span className="font-medium text-gray-900">
                admin@thetiptop.com / admin123
              </span>
            </p>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
