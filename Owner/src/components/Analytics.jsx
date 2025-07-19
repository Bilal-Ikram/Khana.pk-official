import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/auth-context';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, restaurant, token, refreshRestaurant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [],
    recentSales: [],
    salesByDay: {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token || !user) {
          navigate('/login');
          return;
        }

        // Refresh restaurant data if needed
        if (!restaurant) {
          await refreshRestaurant();
        }

        if (!restaurant) {
          navigate('/seller/setup');
          return;
        }

        // Fetch analytics data
        const response = await fetch('https://khana-backend-88zs.onrender.com/api/orders/seller/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        
        // Transform the data into the analytics format
        setAnalytics({
          totalRevenue: data.totalRevenue,
          totalOrders: data.totalOrders,
          averageOrderValue: data.averageOrderValue,
          topSellingItems: data.recentOrders.map(order => ({
            name: order.customerName,
            quantity: 1,
            revenue: order.totalAmount
          })),
          recentSales: data.recentOrders.map(order => ({
            date: order.createdAt,
            amount: order.totalAmount,
            items: 1
          })),
          salesByDay: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0
          }
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, restaurant, navigate, refreshRestaurant]);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Restaurant Required</h2>
        <p className="text-gray-600 mb-4">
          You need to create a restaurant before you can view analytics.
        </p>
        <a 
          href="/seller/setup" 
          className="inline-block bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 transition-colors"
        >
          Create Restaurant
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold text-pink-500">{formatCurrency(analytics.totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Orders</h3>
          <p className="text-3xl font-bold text-pink-500">{analytics.totalOrders}</p>
          <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Average Order Value</h3>
          <p className="text-3xl font-bold text-pink-500">{formatCurrency(analytics.averageOrderValue)}</p>
          <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentSales.map((sale, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(sale.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(sale.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 
