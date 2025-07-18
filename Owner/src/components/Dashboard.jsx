import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/auth-context';
import { BarChart, DollarSign, Users, Clock, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, restaurant, token, refreshRestaurant, loading: authLoading } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersByStatus: {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0
    },
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!token) {
          console.log('No token available, redirecting to login');
          navigate('/login');
          return;
        }

        // Wait for auth loading to complete
        if (authLoading) {
          console.log('Waiting for auth to complete...');
          return;
        }

        // Only refresh restaurant data if we don't have it
        if (!restaurant && !hasAttemptedFetch) {
          console.log('Dashboard: Refreshing restaurant data...');
          const restaurantData = await refreshRestaurant();
          console.log('Dashboard: Restaurant data after refresh:', restaurantData);
          
          if (!restaurantData) {
            console.log('No restaurant data available - redirecting to setup');
            navigate('/seller/setup');
            return;
          }
        }

        // Only fetch stats if we have a restaurant and haven't attempted before
        if (restaurant?._id && !hasAttemptedFetch) {
          console.log('Dashboard: Fetching restaurant stats...');
          const statsResponse = await fetch(`${BACKEND_URL}/api/orders/seller/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const statsData = await statsResponse.json();
          
          if (statsResponse.ok) {
            console.log('Dashboard: Stats data received:', statsData);
            setStats({
              totalOrders: statsData.totalOrders,
              totalRevenue: statsData.totalRevenue,
              averageOrderValue: statsData.averageOrderValue,
              ordersByStatus: statsData.ordersByStatus,
              recentOrders: statsData.recentOrders
            });
            setHasAttemptedFetch(true);
          } else {
            console.error('Dashboard: Error fetching stats:', statsData);
            throw new Error(statsData.message || 'Failed to fetch stats');
          }
        } else if (!restaurant?._id) {
          console.log('Dashboard: No restaurant ID available - redirecting to setup');
          navigate('/seller/setup');
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        const errorMessage = err.message || 'Failed to load dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, restaurant?._id, refreshRestaurant, navigate, authLoading, hasAttemptedFetch]);

  if (!token || !user) {
    navigate('/login');
    return null;
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <AlertCircle className="inline-block mr-2" />
          {error}
        </div>
        <button 
          onClick={() => {
            setHasAttemptedFetch(false);
            window.location.reload();
          }}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <h2>Welcome back, {user.name}!</h2>
        <p>Here's what's happening with your restaurant today.</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <DollarSign className="stat-icon" />
          <h3>Total Revenue</h3>
          <p className="stat-number text-pink-500">$ {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <Package className="stat-icon" />
          <h3>Total Orders</h3>
          <p className="stat-number text-pink-500">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <h3>Average Order Value</h3>
          <p className="stat-number text-pink-500">$ {stats.averageOrderValue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <Users className="stat-icon" />
          <h3>Total Customers</h3>
          <p className="stat-number text-pink-500">{stats.recentOrders.length}</p>
        </div>
      </div>

      <div className="order-status-card">
        <h3>Order Status Overview</h3>
        <div className="status-item">
          <span>Pending Orders</span>
          <span className="orange-number">{stats.ordersByStatus.pending}</span>
        </div>
        <div className="status-item">
          <span>Confirmed Orders</span>
          <span className="blue-number">{stats.ordersByStatus.confirmed}</span>
        </div>
        <div className="status-item">
          <span>Preparing Orders</span>
          <span className="blue-number">{stats.ordersByStatus.preparing}</span>
        </div>
        <div className="status-item">
          <span>Ready for Pickup</span>
          <span className="blue-number">{stats.ordersByStatus.ready}</span>
        </div>
        <div className="status-item">
          <span>Out for Delivery</span>
          <span className="orange-number">{stats.ordersByStatus.outForDelivery}</span>
        </div>
        <div className="status-item">
          <span>Delivered Orders</span>
          <span className="green-number">{stats.ordersByStatus.delivered}</span>
        </div>
        <div className="status-item">
          <span>Cancelled Orders</span>
          <span className="red-number">{stats.ordersByStatus.cancelled}</span>
        </div>
      </div>

      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>Rs. {order.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default Dashboard;