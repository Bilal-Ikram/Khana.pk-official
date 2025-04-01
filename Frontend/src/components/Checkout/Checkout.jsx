import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, CreditCard, Truck, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../Auth/auth-context';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    paymentMethod: 'cod' // Default to Cash on Delivery
  });

  useEffect(() => {
    // Check if user is logged in
    if (!user || !token) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    setCartItems(items);
    calculateTotal(items);
  }, [navigate, user, token]);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    setTotal(sum);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Validate cart items
      if (!cartItems.length) {
        throw new Error('Your cart is empty');
      }

      // Validate restaurant data
      if (!cartItems[0].restaurantId || !cartItems[0].restaurantName) {
        console.error('Cart items:', cartItems);
        throw new Error('Restaurant information is missing. Please try adding the items to cart again.');
      }

      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variation: item.variation || null
        })),
        totalAmount: total,
        deliveryDetails: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          notes: formData.notes || ''
        },
        paymentMethod: formData.paymentMethod,
        restaurantId: cartItems[0].restaurantId,
        restaurantName: cartItems[0].restaurantName
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const data = await response.json();
      
      // Clear cart after successful order
      localStorage.removeItem('cartItems');
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success message and redirect to order tracking
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center py-4 border-b last:border-b-0"
            >
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => { e.target.src = getDefaultImage(); }}
              />
              
              <div className="flex-1 ml-4">
                <h3 className="font-semibold">{item.name}</h3>
                {item.variation && (
                  <p className="text-sm text-gray-500">Variation: {item.variation}</p>
                )}
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                <User className="w-5 h-5 inline-block mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <Phone className="w-5 h-5 inline-block mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <MapPin className="w-5 h-5 inline-block mr-2" />
                Delivery Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your delivery address"
                rows="3"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <MapPin className="w-5 h-5 inline-block mr-2" />
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your city"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <Clock className="w-5 h-5 inline-block mr-2" />
                Delivery Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Any special instructions for delivery?"
                rows="2"
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <CreditCard className="w-5 h-5 inline-block mr-2" />
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="cod">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 