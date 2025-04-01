import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, Star, CheckCircle, XCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../Auth/auth-context';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Please login to view order details');
      navigate('/login');
      return;
    }
    console.log('User and token check:', {
      userId: user?.id,
      hasToken: !!token,
      orderId: id
    });
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id, token, navigate]);

  const fetchOrder = async () => {
    try {
      // Validate authentication
      if (!user?.id || !token) {
        console.error('Missing authentication:', { 
          hasUser: !!user, 
          hasUserId: !!user?.id,
          hasToken: !!token
        });
        setError('Please login to view order details');
        toast.error('Please login to view order details');
        navigate('/login');
        return;
      }

      // Validate order ID
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('Invalid order ID:', { id });
        setError('Invalid order ID format');
        toast.error('Invalid order ID format');
        navigate('/orders');
        return;
      }

      console.log('Fetching order:', {
        orderId: id,
        userId: user.id,
        hasToken: true
      });

      const response = await fetch(`http://localhost:3001/api/orders/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', {
          error: parseError.message,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to parse server response');
      }
      
      if (!response.ok) {
        console.error('Order fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data
        });

        // Handle specific error cases
        switch (response.status) {
          case 400:
            setError(data.message || 'Invalid request');
            toast.error(data.message || 'Invalid request');
            navigate('/orders');
            return;
          case 401:
            setError('Your session has expired');
            toast.error('Your session has expired. Please login again.');
            navigate('/login');
            return;
          case 403:
            setError('Not authorized to view this order');
            toast.error('You are not authorized to view this order');
            navigate('/orders');
            return;
          case 404:
            setError('Order not found');
            toast.error('Order not found');
            navigate('/orders');
            return;
          case 500:
            if (data.message === 'Invalid restaurant data') {
              setError('Restaurant configuration issue');
              toast.error('There is a configuration issue with this restaurant. Our team has been notified.');
              // You might want to add error reporting here
              console.error('Restaurant configuration issue:', {
                orderId: id,
                error: data
              });
              return;
            }
            // Handle other 500 errors
            throw new Error(data.message || data.error || 'Failed to fetch order details');
          default:
            throw new Error(data.message || data.error || 'Failed to fetch order details');
        }
      }

      // Validate required fields
      if (!data || typeof data !== 'object') {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response from server');
      }

      if (!data._id || !data.items || !Array.isArray(data.items) || !data.status) {
        console.error('Missing required fields in order data:', {
          hasId: !!data._id,
          hasItems: !!data.items,
          isItemsArray: Array.isArray(data.items),
          hasStatus: !!data.status,
          data
        });
        throw new Error('Invalid order data received from server');
      }

      // Validate relationships
      if (!data.user || !data.restaurantId) {
        console.error('Missing relationship data:', {
          hasUser: !!data.user,
          hasRestaurant: !!data.restaurantId,
          data
        });
        throw new Error('Order data is missing required relationship information');
      }

      console.log('Order data received:', {
        orderId: data._id,
        status: data.status,
        items: data.items.length,
        hasUser: !!data.user,
        hasRestaurant: !!data.restaurantId,
        userId: data.user?._id,
        restaurantId: data.restaurantId?._id
      });

      setOrder(data);
      setError('');
    } catch (err) {
      console.error('Error fetching order:', {
        error: err.message,
        stack: err.stack,
        orderId: id,
        userId: user?.id
      });
      
      setError(err.message || 'Failed to load order details');
      setOrder(null);
      
      // Handle specific error messages
      if (err.message.includes('Authentication required') || err.message.includes('session expired')) {
        toast.error('Please login to continue');
        navigate('/login');
      } else if (err.message.includes('Not authorized')) {
        toast.error('You are not authorized to view this order');
        navigate('/orders');
      } else if (err.message.includes('not found')) {
        toast.error('Order not found');
        navigate('/orders');
      } else if (err.message.includes('Restaurant configuration')) {
        toast.error('There is a configuration issue with this restaurant. Our team has been notified.');
      } else {
        toast.error(err.message || 'Failed to load order details');
      }
    } finally {
      setLoading(false);
    }
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

  const submitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stars: rating, review })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }

      const data = await response.json();
      setOrder(data);
      toast.success('Thank you for your rating!');
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
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

  if (error || !order) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Order not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Order Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Order Status</h2>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status, index) => (
                <div
                  key={status}
                  className={`flex flex-col items-center relative z-10 ${
                    order.statusHistory.some(h => h.status === status)
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      order.statusHistory.some(h => h.status === status)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <span className="mt-2 text-sm font-medium">
                    {getStatusText(status)}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: (() => {
                    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
                    const currentIndex = statuses.indexOf(order.status);
                    return `${(currentIndex / (statuses.length - 1)) * 100}%`;
                  })()
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center py-2 border-b last:border-b-0"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => { e.target.src = getDefaultImage(); }}
                  />
                  <div className="flex-1 ml-4">
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
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Delivery Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">{order.deliveryDetails.name}</p>
                  <p className="text-gray-500">{order.deliveryDetails.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">{order.deliveryDetails.address}</p>
                  <p className="text-gray-500">{order.deliveryDetails.city}</p>
                </div>
              </div>
              {order.deliveryDetails.notes && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <p className="text-gray-600">{order.deliveryDetails.notes}</p>
                </div>
              )}
            </div>

            {/* Rating Section */}
            {order.status === 'delivered' && !order.rating && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Rate Your Order</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your review (optional)"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows="3"
                  ></textarea>
                  <button
                    onClick={submitRating}
                    disabled={submittingRating}
                    className={`w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors ${
                      submittingRating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {submittingRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </div>
            )}

            {/* Existing Rating */}
            {order.rating && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Your Rating</h3>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${
                        star <= order.rating.stars ? 'text-yellow-400' : 'text-gray-300'
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
    </div>
  );
};

export default OrderTracking; 