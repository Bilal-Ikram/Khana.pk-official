import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth/auth-context';
import { Star, Clock, MapPin, ChevronDown, ChevronUp, Package, CreditCard, Truck, CheckCircle, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [rating, setRating] = useState({ score: 5, review: '' });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
      toast.error('Please log in to view your order history');
    }
    // Load favorites from localStorage
    const favs = JSON.parse(localStorage.getItem('favoriteRestaurants') || '[]');
    setFavorites(favs);
  }, [token]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch('http://localhost:3001/api/orders/user/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load order history');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${ratingOrder._id}/rating`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: rating.score,
          review: rating.review,
          photos: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }
      
      toast.success('Rating submitted successfully');
      setRatingOrder(null);
      setRating({ score: 5, review: '' });
      fetchOrders();
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error(err.message || 'Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'confirmed': 'bg-blue-500',
      'preparing': 'bg-purple-500',
      'ready': 'bg-indigo-500',
      'out_for_delivery': 'bg-orange-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="text-blue-500" />;
      case 'preparing': return <Package className="text-purple-500" />;
      case 'ready': return <Package className="text-indigo-500" />;
      case 'out_for_delivery': return <Truck className="text-orange-500" />;
      case 'delivered': return <CheckCircle className="text-green-500" />;
      case 'cancelled': return <CheckCircle className="text-red-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const isDelivered = (status) => {
    return status === 'delivered' || status === 'DELIVERED';
  };

  const addFavorite = (restaurantId, restaurantName) => {
    let favs = [...favorites];
    if (!favs.some(fav => fav.id === restaurantId)) {
      favs.push({ id: restaurantId, name: restaurantName });
      setFavorites(favs);
      localStorage.setItem('favoriteRestaurants', JSON.stringify(favs));
      toast.success('Added to favorites!');
    } else {
      favs = favs.filter(fav => fav.id !== restaurantId);
      setFavorites(favs);
      localStorage.setItem('favoriteRestaurants', JSON.stringify(favs));
      toast.success('Removed from favorites!');
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Out for Delivery', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-2 rounded-full border ${statusFilter === opt.value ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 border-gray-200'} transition`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowFavoritesModal(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
        >
          View Favorites
        </button>
      </div>
      {filteredOrders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow p-8 text-center"
        >
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 mt-2">Your order history will appear here</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div 
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOrderDetails(order._id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {order.restaurantName}
                      <button
                        onClick={e => { e.stopPropagation(); addFavorite(order.restaurantId, order.restaurantName); }}
                        className={favorites.some(fav => fav.id === order.restaurantId) ? 'text-pink-500' : 'text-gray-400'}
                        title={favorites.some(fav => fav.id === order.restaurantId) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={16} />
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={16} />
                      {order.deliveryDetails.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full text-sm flex items-center justify-center min-w-[120px]`}>
                      <span className="w-full text-center">{order.status.replace(/_/g, ' ').toUpperCase()}</span>
                      {expandedOrder === order._id ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </div>
                  <div className="font-semibold">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <AnimatePresence>
                {expandedOrder === order._id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6">
                      <h4 className="font-medium mb-3">Order Items:</h4>
                      <ul className="space-y-3">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center">
                            <span>{item.name} x {item.quantity}</span>
                            <span className="text-gray-500">${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium mb-2">Payment Details:</h4>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CreditCard size={16} />
                          <span>Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <CheckCircle size={16} />
                          <span>Payment Status: {order.paymentStatus || 'Pending'}</span>
                        </div>
                      </div>
                      
                      {order.statusHistory && order.statusHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium mb-2">Order Timeline:</h4>
                          <div className="space-y-2">
                            {order.statusHistory.map((history, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5"></div>
                                <div>
                                  <div className="font-medium">{history.status.replace(/_/g, ' ').toUpperCase()}</div>
                                  <div className="text-gray-500 text-xs">
                                    {new Date(history.timestamp).toLocaleString()}
                                  </div>
                                  {history.note && (
                                    <div className="text-gray-600 mt-1">{history.note}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isDelivered(order.status) && !order.rating && (
                        <div className="mt-4 pt-4 border-t border-gray-200 px-6 pb-6">
                          {ratingOrder?._id === order._id ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(prev => ({ ...prev, score: star }))}
                                    className={`text-2xl transition-transform duration-200 ${
                                      star <= rating.score ? 'text-yellow-400' : 'text-gray-300'
                                    } hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full p-1 transform hover:scale-110`}
                                    aria-label={`Rate ${star} stars`}
                                  >
                                    ★
                                  </button>
                                ))}
                                <span className="ml-2 text-gray-600 text-sm">
                                  {rating.score} star{rating.score !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <textarea
                                value={rating.review}
                                onChange={e => setRating(prev => ({ ...prev, review: e.target.value }))}
                                placeholder="Write your review (optional)"
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                rows="3"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={submitRating}
                                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                                >
                                  Submit Rating
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRatingOrder(null);
                                    setRating({ score: 5, review: '' });
                                  }}
                                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRatingOrder(order);
                                setRating({ score: 5, review: '' });
                              }}
                              className="text-pink-500 hover:text-pink-600 flex items-center gap-1"
                            >
                              <Star size={16} /> Rate this order
                            </button>
                          )}
                        </div>
                      )}

                      {order.rating && (
                        <div className="mt-4 pt-4 border-t border-gray-200 px-6 pb-6">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Your Rating:</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span
                                  key={star}
                                  className={`text-2xl ${
                                    star <= order.rating.score ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-gray-600">
                              {order.rating.score} star{order.rating.score !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {order.rating.review && (
                            <p className="mt-2 text-gray-600 text-sm">{order.rating.review}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto relative">
            <h2 className="text-lg font-bold mb-4">Favorite Restaurants</h2>
            {favorites.length === 0 ? (
              <div className="text-gray-500">No favorites yet.</div>
            ) : (
              <ul className="space-y-2">
                {favorites.map(fav => (
                  <li key={fav.id} className="flex justify-between items-center">
                    <span>{fav.name}</span>
                    <div className="flex gap-2">
                      <Link to={`/restaurant/${fav.id}`} className="text-pink-500 underline">View</Link>
                      <button onClick={() => addFavorite(fav.id, fav.name)} className="text-red-500">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowFavoritesModal(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded w-full">Close</button>
          </div>
        </div>
      )}

      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto relative">
            <h2 className="text-lg font-bold mb-4">Order Review</h2>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-pink-600">Score:</span>
                <span className="flex items-center gap-1 text-yellow-500 font-bold">
                  {[...Array(selectedReview.score || 0)].map((_, i) => <span key={i}>★</span>)}
                </span>
                <span className="text-gray-400 text-xs">{selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : ''}</span>
              </div>
              <div className="text-gray-700 mb-2">{selectedReview.review}</div>
            </div>
            <button onClick={() => { setShowReviewModal(false); setSelectedReview(null); }} className="mt-4 px-4 py-2 bg-gray-200 rounded w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 