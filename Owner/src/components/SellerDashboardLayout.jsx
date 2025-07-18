import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/auth-context';
import { 
  LayoutDashboard, 
  Store, 
  Menu, 
  ShoppingCart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  ChefHat
} from 'lucide-react';
import '../styles/SellerDashboardLayout.css';
import '../styles/Dashboard.css';

const SellerDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/seller/restaurant', icon: Store, label: 'Restaurant Settings' },
    { path: '/seller/menu', icon: Menu, label: 'Menu Management' },
    { path: '/seller/orders', icon: ShoppingCart, label: 'Order Management' },
    { path: '/seller/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/seller/settings', icon: Settings, label: 'Account Settings' }
  ];

  const handleLogout = () => {
    logout();
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            {!isSidebarCollapsed && (
              <div className="logo-wrapper">
                <ChefHat 
                  className="animated-logo" 
                  size={42} 
                  strokeWidth={2}
                  style={{
                    animation: 'spin 12s linear infinite',
                    color: '#e91e63'
                  }}
                />
              </div>
            )}
            <div className="title-container">
              {!isSidebarCollapsed && (
                <h1 className="sidebar-title">
                  <span className="animated-text">KHANA</span>
                </h1>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="sidebar-toggle"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: isSidebarCollapsed ? 'auto' : '12px',
                  marginRight: isSidebarCollapsed ? 'auto' : '0',
                  background: '#ffe3eb',
                  padding: 0,
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSidebarCollapsed ? 
                  <ChevronRight 
                    size={24} 
                    strokeWidth={2}
                    style={{ color: '#e91e63', stroke: '#e91e63' }}
                  /> : 
                  <ChevronLeft 
                    size={24} 
                    strokeWidth={2}
                    style={{ color: '#e91e63', stroke: '#e91e63' }}
                  />
                }
              </button>
            </div>
          </div>
          {!isSidebarCollapsed && (
            <p className="seller-name">Welcome back, {user?.name || 'Seller'}</p>
          )}
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              {!isSidebarCollapsed && (
                <span className="nav-label">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="logout-icon" />
          {!isSidebarCollapsed && (
            <span className="logout-text">Logout</span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="dashboard-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardLayout; 