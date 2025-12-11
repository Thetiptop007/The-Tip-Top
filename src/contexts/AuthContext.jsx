import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../admin/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and validate token
    const token = localStorage.getItem("adminToken");
    const refreshToken = localStorage.getItem("adminRefreshToken");
    const savedUser = localStorage.getItem("adminUser");
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (userData, token, refreshToken) => {
    localStorage.setItem("adminToken", token);
    if (refreshToken) {
      localStorage.setItem("adminRefreshToken", refreshToken);
    }
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateToken = (newToken) => {
    localStorage.setItem("adminToken", newToken);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
