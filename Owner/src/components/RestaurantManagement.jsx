import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/auth-context';
import { Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const RestaurantManagement = () => {
  const navigate = useNavigate();
  const { user, restaurant: contextRestaurant, token, setRestaurant: setContextRestaurant, refreshRestaurant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    email: '',
    openingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    deliveryRadius: 5,
    minimumOrder: 10,
    deliveryFee: 2,
    isActive: true,
    images: []
  });

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Only refresh restaurant data if we don't have it
        if (!contextRestaurant) {
          await refreshRestaurant();
        }
        
        if (contextRestaurant) {
          setFormData({
            ...contextRestaurant,
            openingHours: contextRestaurant.openingHours || {
              monday: { open: '09:00', close: '22:00' },
              tuesday: { open: '09:00', close: '22:00' },
              wednesday: { open: '09:00', close: '22:00' },
              thursday: { open: '09:00', close: '22:00' },
              friday: { open: '09:00', close: '22:00' },
              saturday: { open: '09:00', close: '22:00' },
              sunday: { open: '09:00', close: '22:00' }
            }
          });
          setImageUrls(contextRestaurant.images?.map(img => `http://localhost:3001${img}`) || []);
        }
      } catch (err) {
        console.error('Error initializing restaurant data:', err);
        setError('Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [token, user, navigate, refreshRestaurant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...newImageUrls]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'openingHours' || key === 'address') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'images') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add images
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('http://localhost:3001/api/restaurants/owner', {
        method: contextRestaurant ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save restaurant data');
      }

      // Update context with new restaurant data
      setContextRestaurant(data);
      
      // Show success message
      const message = contextRestaurant ? 'Restaurant updated successfully' : 'Restaurant created successfully';
      setSuccess(message);
      toast.success(message);

      // Navigate to dashboard after creation
      if (!contextRestaurant) {
        navigate('/seller/dashboard');
      }
    } catch (err) {
      console.error('Error saving restaurant:', err);
      const errorMessage = err.message || 'Failed to save restaurant data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {contextRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Type
              </label>
              <select
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select Cuisine Type</option>
                <option value="Pakistani">Pakistani</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Italian">Italian</option>
                <option value="Fast Food">Fast Food</option>
                <option value="BBQ">BBQ</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Restaurant Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Restaurant ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center h-32 cursor-pointer hover:border-pink-500">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Opening Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(formData.openingHours || {}).map(([day, hours]) => (
              <div key={day} className="space-y-2">
                <h3 className="font-medium capitalize">{day}</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Open</label>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Close</label>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Delivery Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Radius (km)
              </label>
              <input
                type="number"
                name="deliveryRadius"
                value={formData.deliveryRadius}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order ($)
              </label>
              <input
                type="number"
                name="minimumOrder"
                value={formData.minimumOrder}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Fee ($)
              </label>
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors"
          >
            {contextRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
          </button>
          {contextRestaurant && (
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  isActive: !prev.isActive
                }));
              }}
              className={`px-6 py-2 rounded-md transition-colors ${
                formData.isActive
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {formData.isActive ? 'Deactivate Restaurant' : 'Activate Restaurant'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RestaurantManagement;