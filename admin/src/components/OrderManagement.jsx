import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/auth-context';
import { Clock, MapPin, Phone, Star, CheckCircle, XCircle, Filter, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const OrderManagement = () => {
  const navigate = useNavigate();
  const { restaurant, token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      setError('Please login to manage orders');
      toast.error('Please login to manage orders');
      navigate('/login');
      return;
    }

    if (user.role !== 'seller') {
      setError('Only sellers can manage orders');
      toast.error('Only sellers can manage orders');
      navigate('/dashboard');
      return;
    }
    
    if (!restaurant) {
      setError('Please create a restaurant first');
      toast.error('Please create a restaurant first');
      navigate('/seller/restaurant');
      return;
    }

    // Check if user is the restaurant owner
    if (user._id !== restaurant.owner) {
      setError('You are not authorized to manage this restaurant');
      toast.error('You are not authorized to manage this restaurant');
      navigate('/dashboard');
      return;
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, [restaurant, token, statusFilter, navigate, user]);

  const fetchOrders = async () => {
    try {
      setError('');
      setLoading(true);

      if (!restaurant?._id) {
        throw new Error('Restaurant ID is missing');
      }

      // Validate user is restaurant owner
      if (user._id !== restaurant.owner) {
        throw new Error('Not authorized to view orders');
      }

      const url = `http://localhost:3001/api/orders/restaurant/${restaurant._id}${
        statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      }`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch orders: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load orders';
      setError(errorMessage);
      toast.error(errorMessage);

      if (err.message.includes('Not authorized')) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      setError('');

      if (!user?._id) {
        throw new Error('User session expired. Please login again.');
      }

      // Validate user is restaurant owner
      if (user._id !== restaurant.owner) {
        throw new Error('Not authorized to update order status');
      }

      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      await fetchOrders();
      toast.success('Order status updated successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);

      if (err.message.includes('Not authorized')) {
        navigate('/dashboard');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-purple-500';
      case 'ready':
        return 'bg-indigo-500';
      case 'out_for_delivery':
        return 'bg-orange-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return getDefaultImage();
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=300&q=80';
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
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                      disabled={updatingStatus}
                      className="bg-pink-500 text-white px-4 py-1 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      {getStatusText(getNextStatus(order.status))}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 border-b pb-3 last:border-b-0"
                      >
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => { e.target.src = getDefaultImage(); }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.variation && (
                            <p className="text-sm text-gray-500">
                              Variation: {item.variation}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Payment Method: {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <h3 className="font-semibold mb-3">Customer Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium">
                          {order.deliveryDetails.name}
                        </p>
                        <p className="text-gray-500">
                          {order.deliveryDetails.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium">
                          {order.deliveryDetails.address}
                        </p>
                        <p className="text-gray-500">
                          {order.deliveryDetails.city}
                        </p>
                      </div>
                    </div>
                    {order.deliveryDetails.notes && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-1" />
                        <p className="text-gray-600">
                          {order.deliveryDetails.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  {order.rating && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Customer Rating</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-2xl ${
                              star <= order.rating.stars
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {order.rating.review && (
                        <p className="text-gray-600">{order.rating.review}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;