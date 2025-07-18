import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  CheckCircle,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../Auth/auth-context';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState({ score: 0, review: '' });
  const [photos, setPhotos] = useState([]);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  // Reset rating form when order changes
  useEffect(() => {
    if (order) {
      // Initialize rating from existing order rating if it exists
      if (order.rating) {
        setRating({
          score: order.rating.score || 0,
          review: order.rating.review || ''
        });
        setPhotos(order.rating.photos || []);
      } else {
        setRating({ score: 0, review: '' });
        setPhotos([]);
      }
    }
  }, [order]);

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
              toast.error(
                'There is a configuration issue with this restaurant. Our team has been notified.'
              );
              console.error('Restaurant configuration issue:', {
                orderId: id,
                error: data
              });
              return;
            }
            throw new Error(data.message || data.error || 'Failed to fetch order details');
          default:
            throw new Error(data.message || data.error || 'Failed to fetch order details');
        }
      }

      // Validate required fields
      if (
        !data ||
        typeof data !== 'object' ||
        !data._id ||
        !data.items ||
        !Array.isArray(data.items) ||
        !data.status
      ) {
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
        throw new Error(
          'Order data is missing required relationship information'
        );
      }

      console.log('Order data received:', {
        orderId: data._id,
        status: data.status,
        isDelivered: isDelivered(data.status),
        hasRating: !!data.rating
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

      if (
        err.message.includes('Authentication required') ||
        err.message.includes('session expired')
      ) {
        toast.error('Please login to continue');
        navigate('/login');
      } else if (err.message.includes('Not authorized')) {
        toast.error('You are not authorized to view this order');
        navigate('/orders');
      } else if (err.message.includes('not found')) {
        toast.error('Order not found');
        navigate('/orders');
      } else if (err.message.includes('Restaurant configuration')) {
        toast.error(
          'There is a configuration issue with this restaurant. Our team has been notified.'
        );
      } else {
        toast.error(err.message || 'Failed to load order details');
      }
    } finally {
      setLoading(false);
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'pending':
  //       return 'bg-yellow-500';
  //     case 'confirmed':
  //       return 'bg-blue-500';
  //     case 'preparing':
  //       return 'bg-purple-500';
  //     case 'ready':
  //       return 'bg-indigo-500';
  //     case 'out_for_delivery':
  //       return 'bg-orange-500';
  //     case 'delivered':
  //       return 'bg-green-500';
  //     case 'cancelled':
  //       return 'bg-red-500';
  //     default:
  //       return 'bg-gray-500';
  //   }
  // };

  const getStatusText = (status) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5 || photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    setUploadingPhotos(true);

    try {
      const base64Files = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = (e) => reject(e);
              reader.readAsDataURL(file);
            })
        )
      );

      const uploadPromises = base64Files.map(async (base64File) => {
        const formData = new FormData();
        formData.append('file', base64File);
        formData.append('upload_preset', 'khana_uploads');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload ',
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload to Cloudinary');
        }

        const result = await response.json();
        return result.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setPhotos([...photos, ...uploadedUrls]);
      toast.success('Photos uploaded successfully');
    } catch (err) {
      console.error('Error uploading photos:', err);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const submitRating = async () => {
    if (rating.score === 0) {
      toast.error('Please select a rating');
      return;
    }

    console.log('Submitting rating:', {
      orderId: id,
      rating: rating.score,
      review: rating.review,
      photosCount: photos.length
    });

    setSubmittingRating(true);

    try {
      const response = await fetch(`http://localhost:3001/api/orders/${id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          score: rating.score,
          review: rating.review,
          photos
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Rating submission failed:', {
          status: response.status,
          data
        });
        throw new Error(data.message || 'Failed to submit rating');
      }

      if (data.order) {
        setOrder({
          ...order,
          rating: {
            score: rating.score,
            review: rating.review,
            photos: photos,
            createdAt: new Date()
          }
        });
        toast.success('Thank you for your rating!');
        setRating({ score: 0, review: '' });
        setPhotos([]);
      } else {
        throw new Error('Invalid response from server');
      }
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

  const isDelivered = (status) => {
    return status.toLowerCase() === 'delivered';
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
    <div
      className="max-w-7xl mx-auto px-4 py-8"
      data-testid="khana-pk-main-container"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Order Status */}
        <div className="mb-8" data-testid="order-status">
          <h2 className="text-2xl font-bold mb-4">Order Status</h2>
          <div className="relative" data-testid="order-timeline">
            <div className="flex items-center justify-between mb-8">
              {[
                'pending',
                'confirmed',
                'preparing',
                'ready',
                'out_for_delivery',
                'delivered'
              ].map((status) => (
                <div
                  key={status}
                  className={`flex flex-col items-center relative z-10 ${
                    order.statusHistory.some((h) => h.status === status)
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      order.statusHistory.some((h) => h.status === status)
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
                    const statuses = [
                      'pending',
                      'confirmed',
                      'preparing',
                      'ready',
                      'out_for_delivery',
                      'delivered'
                    ];
                    const currentIndex = statuses.indexOf(order.status);
                    return `${(currentIndex / (statuses.length - 1)) * 100}%`;
                  })()
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div
          className="mb-8 bg-pink-50 rounded-lg p-6"
          data-testid="rating-section"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Your Rating</h3>
            {order.rating && !isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setRating({
                    score: order.rating.score || 0,
                    review: order.rating.review || ''
                  });
                  setPhotos(order.rating.photos || []);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                data-testid="edit-rating-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 012.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Your Rating
              </button>
            )}
          </div>

          {order.status && isDelivered(order.status) ? (
            !order.rating || isEditing ? (
              <div className="space-y-4" data-testid="rating-form">
                {/* Star Rating */}
                <div className="flex items-center gap-2" data-testid="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating((prev) => ({ ...prev, score: star }));
                      }}
                      className={`text-3xl cursor-pointer select-none transform hover:scale-110 transition-transform ${
                        star <= rating.score
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg p-1`}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600 text-sm">
                    {rating.score
                      ? `${rating.score} star${rating.score !== 1 ? 's' : ''}`
                      : 'Click to rate'}
                  </span>
                </div>

                {/* Review Text Area */}
                <div className="mt-4">
                  <label
                    htmlFor="review"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Write your review (optional)
                  </label>
                  <textarea
                    id="review"
                    value={rating.review}
                    onChange={(e) =>
                      setRating((prev) => ({ ...prev, review: e.target.value }))
                    }
                    placeholder="Share your experience with this order..."
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    rows="4"
                    data-testid="review-textarea"
                  ></textarea>
                </div>

                {/* Photo Upload */}
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Add Photos (Optional, max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhotos || photos.length >= 5}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="photo-upload-input"
                  />
                  {uploadingPhotos && (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                      <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                  {photos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2" data-testid="photo-preview">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = [...photos];
                              newPhotos.splice(index, 1);
                              setPhotos(newPhotos);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            aria-label="Remove photo"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={submitRating}
                    disabled={!rating.score || submittingRating || uploadingPhotos}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      !rating.score || submittingRating || uploadingPhotos
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-pink-500 text-white hover:bg-pink-600 transition-colors cursor-pointer'
                    }`}
                    data-testid={
                      isEditing
                        ? 'update-rating-button'
                        : 'submit-rating-button'
                    }
                  >
                    {submittingRating
                      ? 'Submitting...'
                      : isEditing
                      ? 'Update Rating'
                      : 'Submit Rating'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setRating({
                          score: order.rating.score,
                          review: order.rating.review || ''
                        });
                        setPhotos(order.rating.photos || []);
                      }}
                      className="px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                      data-testid="cancel-edit-button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4" data-testid="rating-display">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-3xl select-none ${
                        star <= order.rating.score ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {order.rating.score}{' '}
                    {order.rating.score !== 1 ? 'stars' : 'star'}
                  </span>
                </div>

                {order.rating.review && (
                  <p className="text-gray-700 bg-white p-4 rounded-lg">
                    {order.rating.review}
                  </p>
                )}

                {order.rating.photos &&
                  order.rating.photos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2" data-testid="photo-preview">
                      {order.rating.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setRating({
                      score: order.rating.score || 0,
                      review: order.rating.review || ''
                    });
                    setPhotos(order.rating.photos || []);
                  }}
                  className="w-full mt-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors flex items-center justify-center gap-2"
                  data-testid="edit-rating-button-secondary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 012.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Click here to edit your rating
                </button>
              </div>
            )
          ) : (
            <p className="text-gray-600">
              You can rate this order once it has been delivered. Current status:{' '}
              {getStatusText(order.status)}
            </p>
          )}
        </div>

        {/* Order Details */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          data-testid="order-details"
        >
          <div data-testid="order-summary">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center py-2 border-b last:border-b-0"
                  data-testid="order-summary-item"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = getDefaultImage();
                    }}
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
                  <span data-testid="order-total">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div data-testid="delivery-details">
            <h3 className="text-lg font-semibold mb-4">Delivery Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3" data-testid="delivery-details-name">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">{order.deliveryDetails.name}</p>
                  <p className="text-gray-500">{order.deliveryDetails.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3" data-testid="delivery-details-address">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">
                    {order.deliveryDetails.address}, {order.deliveryDetails.city}
                  </p>
                </div>
              </div>

              {order.deliveryDetails.notes && (
                <div className="flex items-start gap-3" data-testid="delivery-notes">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <p className="text-gray-600">{order.deliveryDetails.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;