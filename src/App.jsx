import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AppLayout from './layout/AppLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Orders from './pages/Admin/Orders';
import MenuItems from './pages/Admin/MenuItems';
import Customers from './pages/Admin/Customers';
import Settings from './pages/Admin/Settings';
import DeliveryAgents from './pages/Admin/DeliveryAgents';
import Login from './pages/Admin/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path='/menu' element={<Menu />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="menu-items" element={<MenuItems />} />
            <Route path="customers" element={<Customers />} />
            <Route path="delivery-agents" element={<DeliveryAgents />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
