import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Star, Info, Menu, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [favorites, setFavorites] = useState([]);
  
  // Refs for scroll animations
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchRestaurantDetails();
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteItems') || '[]');
    setFavorites(savedFavorites);
    
    // Set up intersection observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    
    // Observe elements
    if (headerRef.current) observer.observe(headerRef.current);
    if (tabsRef.current) observer.observe(tabsRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    
    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (tabsRef.current) observer.unobserve(tabsRef.current);
      if (contentRef.current) observer.unobserve(contentRef.current);
    };
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const [restaurantResponse, menuResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/restaurants/${id}`),
        fetch(`http://localhost:3001/api/menu-items/restaurant/${id}`)
      ]);

      if (!restaurantResponse.ok) {
        throw new Error('Failed to fetch restaurant details');
      }

      const restaurantData = await restaurantResponse.json();
      setRestaurant(restaurantData);

      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData);
      } else {
        console.error('Failed to fetch menu items:', await menuResponse.text());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load restaurant details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=300&q=80';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return getDefaultImage();
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  };
  
  const toggleFavorite = (item) => {
    const currentFavorites = [...favorites];
    const existingIndex = currentFavorites.findIndex(fav => fav._id === item._id);
    
    if (existingIndex >= 0) {
      currentFavorites.splice(existingIndex, 1);
      toast.success('Removed from favorites!');
    } else {
      currentFavorites.push({
        _id: item._id,
        name: item.name,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name
      });
      toast.success('Added to favorites!');
    }
    
    setFavorites(currentFavorites);
    localStorage.setItem('favoriteItems', JSON.stringify(currentFavorites));
  };
  
  const isFavorite = (itemId) => {
    return favorites.some(fav => fav._id === itemId);
  };

  const addToCart = (item) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Check if cart has items from a different restaurant
    if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurant._id) {
      if (window.confirm(`Your cart contains items from ${cartItems[0].restaurantName}. Would you like to clear your cart and add items from ${restaurant.name} instead?`)) {
        // Clear cart and add new item
        const newCartItem = {
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
          restaurantId: restaurant._id,
          restaurantName: restaurant.name
        };
        localStorage.setItem('cartItems', JSON.stringify([newCartItem]));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Cart updated with new item!');
      } else {
        toast.info('You can only add items from one restaurant at a time');
      }
      return;
    }

    // If cart is empty or has items from same restaurant
    const existingItem = cartItems.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      existingItem.quantity += 1;
      toast.success('Item quantity updated in cart!');
    } else {
      cartItems.push({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name
      });
      toast.success('Item added to cart!');
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Restaurant not found</h2>
      </div>
    );
  }

  const today = new Date().getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[today];

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Restaurant Header with animation */}
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl shadow-lg overflow-hidden mb-8 opacity-0 translate-y-8 animate-in-class"
        >
          <div className="relative h-72 md:h-96">
            <img
              src={getImageUrl(restaurant.images?.[0])}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getDefaultImage();
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
                    <div className="flex items-center gap-3 text-white mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold">{restaurant.rating?.toFixed(1) || '4.5'}</span>
                        <span className="text-gray-300">({restaurant.totalRatings || '243'} ratings)</span>
                      </div>
                      <span className="px-3 py-1 bg-pink-500/90 text-white rounded-full text-sm">
                        {restaurant.cuisineType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="px-3 py-1 bg-white/90 text-pink-500 rounded-lg text-sm font-medium">
                      {restaurant.openingHours[currentDay]?.open || '10:00 AM'} - {restaurant.openingHours[currentDay]?.close || '10:00 PM'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white border-t border-pink-100">
            <p className="text-gray-700 mb-6">{restaurant.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-pink-50 p-2 rounded-full">
                  <MapPin className="w-5 h-5 text-pink-500" />
                </div>
                <span className="text-gray-700">
                  {restaurant.address.street}, {restaurant.address.city}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-pink-50 p-2 rounded-full">
                  <Phone className="w-5 h-5 text-pink-500" />
                </div>
                <span className="text-gray-700">{restaurant.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-pink-50 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-pink-500" />
                </div>
                <span className="text-gray-700">
                  {restaurant.deliveryRadius} mile delivery radius
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs with animation */}
        <motion.div
          ref={tabsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 opacity-0 translate-y-8 animate-in-class"
        >
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-300 ${
                activeTab === 'menu'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                  : 'bg-white border border-pink-100 text-gray-600 hover:bg-pink-50'
              }`}
            >
              <Menu className="w-5 h-5" />
              Menu
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-300 ${
                activeTab === 'info'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                  : 'bg-white border border-pink-100 text-gray-600 hover:bg-pink-50'
              }`}
            >
              <Info className="w-5 h-5" />
              Info
            </button>
          </div>
        </motion.div>

        {/* Tab Content with animation */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="opacity-0 translate-y-8 animate-in-class"
        >
          {activeTab === 'menu' ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-pink-50">
              <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b border-pink-100 pb-4">Our Menu</h2>
              {menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Menu className="w-16 h-16 text-pink-200 mb-4" />
                  <p className="text-gray-500 text-lg">No menu items available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item, index) => (
                    <motion.div 
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="bg-white rounded-xl overflow-hidden border border-pink-50 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <Link to={`/menu-item/${item._id}`} className="block">
                        <div className="relative h-48 overflow-hidden group">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = getDefaultImage();
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(item);
                            }}
                            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-pink-50"
                          >
                            <Heart className={`w-5 h-5 ${isFavorite(item._id) ? 'text-pink-500 fill-pink-500' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/menu-item/${item._id}`} className="block">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 hover:text-pink-500 transition-colors">
                              {item.name}
                            </h3>
                            <span className="text-lg font-semibold text-pink-500">
                              ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {item.description || 'Delicious dish prepared with the finest ingredients.'}
                          </p>
                        </Link>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.isVegetarian && (
                              <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                                Vegetarian
                              </span>
                            )}
                            {item.isSpicy && (
                              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                                Spicy
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-pink-50">
              <h2 className="text-2xl font-bold mb-8 text-gray-800 border-b border-pink-100 pb-4">Restaurant Information</h2>
              <div className="space-y-8">
                <div className="p-6 bg-pink-50/50 rounded-xl">
                  <h3 className="font-semibold text-lg mb-4 text-pink-700">Opening Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                      <div key={day} className={`flex justify-between p-2 rounded ${day === currentDay ? 'bg-pink-100' : ''}`}>
                        <span className="capitalize font-medium">{day}</span>
                        <span className="text-gray-700">
                          {hours.open} - {hours.close}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 bg-pink-50/50 rounded-xl">
                  <h3 className="font-semibold text-lg mb-4 text-pink-700">Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-100 rounded-full">
                          <MapPin className="w-5 h-5 text-pink-500" />
                        </div>
                        <span className="font-medium">Delivery Radius</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">{restaurant.deliveryRadius} miles</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-100 rounded-full">
                          <ShoppingCart className="w-5 h-5 text-pink-500" />
                        </div>
                        <span className="font-medium">Minimum Order</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">${restaurant.minimumOrder}</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-100 rounded-full">
                          <Clock className="w-5 h-5 text-pink-500" />
                        </div>
                        <span className="font-medium">Delivery Fee</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">${restaurant.deliveryFee}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-pink-50/50 rounded-xl">
                  <h3 className="font-semibold text-lg mb-4 text-pink-700">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-full">
                        <Phone className="w-5 h-5 text-pink-500" />
                      </div>
                      <span className="text-gray-800">{restaurant.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-full">
                        <Info className="w-5 h-5 text-pink-500" />
                      </div>
                      <span className="text-gray-800">{restaurant.email || 'contact@restaurant.com'}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-pink-100 rounded-full">
                        <MapPin className="w-5 h-5 text-pink-500" />
                      </div>
                      <span className="text-gray-800">
                        {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Custom CSS for scroll animations */}
      <style jsx>{`
        .animate-in-class {
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetails;