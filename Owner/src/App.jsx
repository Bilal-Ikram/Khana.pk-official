import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './Auth/auth-context';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import RestaurantManagement from './components/RestaurantManagement';
import MenuManagement from './components/MenuManagement';
import OrderManagement from './components/OrderManagement';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import SellerDashboardLayout from './components/SellerDashboardLayout';

const PrivateRoute = ({ children }) => {
  const { token, user } = useAuth();
  
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/seller/*"
            element={
              <PrivateRoute>
                <SellerDashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="restaurant" element={<RestaurantManagement />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/seller/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
