import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, Clock, Star, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantListing = () => {
  const [isGridView, setIsGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [cuisine, setCuisine] = useState('All Categories');
  const [featured, setFeatured] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/restaurants');
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      setError('Failed to load restaurants. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return getDefaultImage();
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search filter
    if (searchQuery && !restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !restaurant.cuisineType.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Cuisine filter
    if (cuisine !== 'All Categories' && restaurant.cuisineType !== cuisine) {
      return false;
    }
    
    // Featured filter
    if (featured && !restaurant.featured) {
      return false;
    }
    
    // Open now filter
    if (openNow) {
      const now = new Date();
      const day = now.getDay();
      const time = now.getHours() + ':' + now.getMinutes();
      const dayName = Object.keys(restaurant.openingHours)[day];
      const hours = restaurant.openingHours[dayName];
      
      if (!hours.open || !hours.close || time < hours.open || time > hours.close) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-pink-200 rounded-full opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-8 border-pink-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 112 0v2a1 1 0 11-2 0V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const cuisineOptions = ['All Categories', 'Pizza', 'Fast Food', 'Desi', 'BBQ', 'Biryani', 'Cafe'];

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header with view toggle and filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="text-pink-500">Discover</span> Restaurants
        </h1>
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all border border-gray-100"
          >
            <Filter className="w-5 h-5 text-pink-500" />
            <span>Filters</span>
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.div>
          </motion.button>
          <div className="flex items-center bg-white rounded-lg shadow overflow-hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGridView(true)}
              className={`p-2 transition-colors ${isGridView ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGridView(false)}
              className={`p-2 transition-colors ${!isGridView ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mb-6 p-6 bg-white rounded-xl shadow">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or cuisine"
                      className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>

                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                  <div className="relative">
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="appearance-none w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                    >
                      {cuisineOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  <div className="flex gap-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="sr-only"
                        />
                        <div className="w-10 h-6 bg-gray-200 rounded-full transition"></div>
                        <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full transition-transform ${featured ? 'bg-pink-600 transform translate-x-4' : 'bg-white'}`}></div>
                      </div>
                      <span className="ml-2 text-gray-700">Featured Only</span>
                    </label>

                    <label className="inline-flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={openNow}
                          onChange={(e) => setOpenNow(e.target.checked)}
                          className="sr-only"
                        />
                        <div className="w-10 h-6 bg-gray-200 rounded-full transition"></div>
                        <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full transition-transform ${openNow ? 'bg-pink-600 transform translate-x-4' : 'bg-white'}`}></div>
                      </div>
                      <span className="ml-2 text-gray-700">Open Now</span>
                    </label>
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg font-medium"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      {filteredRestaurants.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-pink-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Restaurants Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Restaurant Grid/List */}
      <div className={`mt-8 ${isGridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
        {filteredRestaurants.map((restaurant, index) => (
          <motion.div
            key={restaurant._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              to={`/restaurant/${restaurant._id}`}
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 block ${
                isGridView ? '' : 'flex'
              }`}
            >
              <div 
                className={`relative ${isGridView ? 'w-full h-48' : 'w-48 h-full flex-shrink-0'}`}
              >
                <img
                  src={getImageUrl(restaurant.images?.[0])}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getDefaultImage();
                  }}
                />
                {restaurant.featured && (
                  <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    Featured
                  </div>
                )}
              </div>
              <div className={`p-5 ${isGridView ? '' : 'flex-1'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800 hover:text-pink-600 transition-colors">{restaurant.name}</h2>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{(restaurant.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-500 text-xs">({restaurant.totalRatings || 0})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">{restaurant.cuisineType}</span>
                  {restaurant.priceRange && (
                    <span className="text-gray-600 text-sm">
                      {Array(restaurant.priceRange).fill('$').join('')}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  {restaurant.address?.street}, {restaurant.address?.city}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-pink-500" />
                    <span>${restaurant.minimumOrder || 0} min</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span>${restaurant.deliveryFee || 0} fee</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantListing;