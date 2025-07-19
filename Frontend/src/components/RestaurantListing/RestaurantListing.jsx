import { useState, useEffect, useRef } from "react";
import {
  Filter,
  Grid,
  List,
  Clock,
  Star,
  ChevronDown,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";

const RestaurantListing = () => {
  const [isGridView, setIsGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [cuisine, setCuisine] = useState("All Categories");
  const [featured, setFeatured] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocationFiltered, setIsLocationFiltered] = useState(false);
  // New state for restaurant search suggestions
  const [restaurantSuggestions, setRestaurantSuggestions] = useState([]);
  const [showRestaurantSuggestions, setShowRestaurantSuggestions] =
    useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  // Debouncing for search
  const searchTimeoutRef = useRef(null);
  // List of available cuisines
  const cuisineOptions = [
    "All Categories",
    "Pakistani",
    "Indian",
    "Chinese",
    "Italian",
    "Fast Food",
    "BBQ",
    "Desserts",
    "Biryani",
    "Cafe",
    "Pizza",
    "Burgers",
    "Seafood",
    "Thai",
    "Japanese",
    "Mexican",
  ];
  useEffect(() => {
    fetchRestaurants();
    // Add event listener for location search from HeroSection
    const handleLocationSearch = (event) => {
      const { results, location } = event.detail;
      setRestaurants(results);
      setLocationSearch(location);
      setIsLocationFiltered(true);
      setLoading(false);
    };
    document.addEventListener("locationSearch", handleLocationSearch);
    return () => {
      document.removeEventListener("locationSearch", handleLocationSearch);
    };
  }, []);
  useEffect(() => {
    const favs = JSON.parse(
      localStorage.getItem("favoriteRestaurants") || "[]"
    );
    setFavorites(favs);
  }, []);
  const fetchRestaurants = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://khana-backend-88zs.onrender.com";
      const response = await axios.get(`${apiUrl}/api/restaurants`);
      setRestaurants(response.data);
    } catch {
      setError("Failed to load restaurants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  // New function to search restaurants by name
  const searchRestaurants = async (query) => {
    if (!query.trim()) {
      setRestaurantSuggestions([]);
      setShowRestaurantSuggestions(false);
      return;
    }
    setSearchLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://khana-backend-88zs.onrender.com";
      const response = await axios.get(`${apiUrl}/api/restaurants/search`, {
        params: { q: query },
      });
      setRestaurantSuggestions(response.data);
      setShowRestaurantSuggestions(true);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to local search if API endpoint doesn't exist
      const localResults = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.cuisineType.toLowerCase().includes(query.toLowerCase())
      );
      setRestaurantSuggestions(localResults.slice(0, 5)); // Limit to 5 suggestions
      setShowRestaurantSuggestions(true);
    } finally {
      setSearchLoading(false);
    }
  };
  // Debounced search function
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchRestaurants(value);
    }, 300); // 300ms delay
  };
  // Function to select a restaurant from suggestions
  const selectRestaurant = (restaurant) => {
    setSearchQuery(restaurant.name);
    setShowRestaurantSuggestions(false);
    // Optionally scroll to the restaurant or highlight it
    scrollToRestaurant(restaurant._id);
  };
  // Function to scroll to a specific restaurant
  const scrollToRestaurant = (restaurantId) => {
    const element = document.querySelector(
      `[data-restaurant-id="${restaurantId}"]`
    );
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-restaurant");
      setTimeout(() => {
        element.classList.remove("highlight-restaurant");
      }, 2000);
    }
  };
  const getDefaultImage = () => {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
  };
  const getImageUrl = (imagePath) => {
    if (!imagePath) return getDefaultImage();
    if (imagePath.startsWith("http")) return imagePath;
    return `https://khana-backend-88zs.onrender.com${imagePath}`;
  };
  const toggleFavorite = (restaurant) => {
    let favs = [...favorites];
    if (!favs.some((fav) => fav.id === restaurant._id)) {
      favs.push({ id: restaurant._id, name: restaurant.name });
      setFavorites(favs);
      localStorage.setItem("favoriteRestaurants", JSON.stringify(favs));
      toast.success("Added to favorites!");
    } else {
      favs = favs.filter((fav) => fav.id !== restaurant._id);
      setFavorites(favs);
      localStorage.setItem("favoriteRestaurants", JSON.stringify(favs));
      toast.success("Removed from favorites!");
    }
  };
  const isFavorite = (id) => favorites.some((fav) => fav.id === id);
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Search filter - now searches both name and cuisine
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = restaurant.name.toLowerCase().includes(searchLower);
      const cuisineMatch = restaurant.cuisineType
        .toLowerCase()
        .includes(searchLower);
      if (!nameMatch && !cuisineMatch) {
        return false;
      }
    }
    // Cuisine filter
    if (cuisine !== "All Categories" && restaurant.cuisineType !== cuisine) {
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
      const time = now.getHours() + ":" + now.getMinutes();
      const dayName = Object.keys(restaurant.openingHours || {})[day];
      const hours = restaurant.openingHours?.[dayName];
      if (
        !hours?.open ||
        !hours?.close ||
        time < hours.open ||
        time > hours.close
      ) {
        return false;
      }
    }
    if (showFavoritesOnly && !isFavorite(restaurant._id)) return false;
    return true;
  });
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setShowRestaurantSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
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
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 112 0v2a1 1 0 11-2 0V5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
   <div
      id="restaurantListing"
      className="container mx-auto px-4 py-8 bg-white min-h-screen"
      data-testid="khana-pk-main-container"
    >
      {/* Add CSS for highlight effect */}
      <style>{`
        .highlight-restaurant {
          animation: highlight 2s ease-in-out;
          transform: scale(1.02);
        }
        @keyframes highlight {
          0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(236, 72, 153, 0.2); }
          100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.0); }
        }
      `}</style>
      {/* Header with view toggle and filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold md:font-bold text-[#090C0F]">
          {isLocationFiltered ? (
            <>
              <span className="text-pink-500">Restaurants</span> in{" "}
              {locationSearch}
            </>
          ) : (
            <>
              <span className="text-pink-500">Discover</span> Restaurants
            </>
          )}
        </h1>
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white rounded-lg shadow hover:shadow-md transition-all border border-gray-100"
            data-testid="filter-button"
          >
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
            <span className="text-sm md:text-base">Filters</span>
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
            </motion.div>
          </motion.button>
          <div className="hidden md:flex items-center bg-white rounded-lg shadow overflow-hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGridView(true)}
              className={`p-2 transition-colors ${
                isGridView
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              data-testid="grid-view-toggle"
            >
              <Grid className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGridView(false)}
              className={`p-2 transition-colors ${
                !isGridView
                  ? "bg-pink-500 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              data-testid="list-view-toggle"
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      {/* Enhanced Search Bar */}
      <div className="mb-4 md:mb-6 search-container relative" data-testid="search-bar">
        <div className="relative">
          <input
            type="text"
            placeholder="Search restaurants by name or cuisine"
            value={searchQuery}
            onChange={handleSearchInput}
            className="w-full p-2 pl-10 md:p-4 md:pl-12 md:pr-10  rounded-md  md:rounded-lg text-xs md:text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            data-testid="search-input"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 md:h-4 md:w-4" />
          {searchLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-2 w-2 md:h-4 md:w-4 border-2 border-pink-500 border-t-transparent"></div>
            </div>
          )}
        </div>
        {/* Restaurant Suggestions Dropdown */}
        {showRestaurantSuggestions && restaurantSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-1 border-b">
                Restaurant Suggestions
              </div>
              {restaurantSuggestions.map((restaurant) => (
                <button
                  key={restaurant._id}
                  onClick={() => selectRestaurant(restaurant)}
                  className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(restaurant.images?.[0])}
                      alt={restaurant.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-medium text-gray-900"
                          data-testid="restaurant-name"
                        >
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            {(restaurant.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                          {restaurant.cuisineType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {restaurant.address?.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* No results message for search */}
        {showRestaurantSuggestions &&
          restaurantSuggestions.length === 0 &&
          searchQuery &&
          !searchLoading && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center">
              <p className="text-gray-500 text-sm">
                No restaurants found matching ${searchQuery}
              </p>
            </div>
          )}
      </div>
      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mb-6 p-6 bg-white rounded-xl shadow">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="min-w-[150px]" data-testid="cuisine-filter">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine
                  </label>
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
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Featured Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openNow}
                      onChange={(e) => setOpenNow(e.target.checked)}
                      className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Open Now</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Favorites tab */}
      <div className="flex gap-2 mb-4 md:mb-6">
        <button
          onClick={() => setShowFavoritesOnly(false)}
          className={`px-2 py-1 md:px-4  md:py-2 rounded-3xl md:rounded-full border ${
            !showFavoritesOnly
              ? "bg-pink-500 text-white"
              : "bg-white text-gray-700 border-gray-200"
          } transition`}
        >
          All
        </button>
        <button
          onClick={() => setShowFavoritesOnly(true)}
          className={`px-2 py-1 md:px-4  md:py-2 rounded-3xl md:rounded-full border ${
            showFavoritesOnly
              ? "bg-yellow-400 text-white"
              : "bg-white text-gray-700 border-gray-200"
          } transition`}
        >
          Favorites
        </button>
      </div>
      {/* No results message */}
      {filteredRestaurants.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-pink-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Restaurants Found
          </h3>
          {searchQuery ? (
            <p className="text-gray-600">
              `No restaurants found matching ${searchQuery}. Try a different
              search term.`
            </p>
          ) : isLocationFiltered ? (
            <>
              <p className="text-gray-600 mb-4">
                No restaurants available in {locationSearch} yet.
              </p>
              <p className="text-gray-600">
                We&apos;re working on bringing the best restaurants to your city
                soon!
              </p>
            </>
          ) : (
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          )}
        </div>
      )}
      {/* Restaurant Grid/List */}
      <div
        className={
          isGridView
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-6 md:mx-4 py-2 md:py-0"
            : "space-y-4"
        }
      >
        {filteredRestaurants.map((restaurant) => (
          <motion.div
            key={restaurant._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
              !isGridView ? "flex" : ""
            }`}
            data-testid="restaurant-card"
            data-restaurant-id={restaurant._id}
          >
            <Link
              to={`/restaurant/${restaurant._id}`}
              className={` rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                isGridView ? "" : "flex"
              }`}
              data-testid="view-restaurant"
            >
              <div
                className={`relative ${isGridView ? "aspect-video" : "w-48"}`}
              >
                <img
                  src={getImageUrl(restaurant.images?.[0])}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                {restaurant.featured && (
                  <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>
              <div className={`p-3 md:p-5 ${isGridView ? "" : "flex-1"}`}>
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <h2
                    className="text-xl font-bold text-gray-800 hover:text-pink-600 transition-colors"
                    data-testid="restaurant-name"
                  >
                    {restaurant.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(restaurant);
                      }}
                      className={
                        isFavorite(restaurant._id)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                      title={
                        isFavorite(restaurant._id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      data-testid={
                        isFavorite(restaurant._id)
                          ? "remove-from-favorites"
                          : "add-to-favorites"
                      }
                    >
  
                    </button>
                    <div className="flex items-center px-1 py-0 md:px-2 md:py-1 rounded">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-orange-400 fill-current mr-[2px]" />
                      <span className="text-xs font-sans text-[#2E3138] font-semibold ml-1">
                        {(restaurant.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-[#7B8084] text-xs font-sans font-normal ml-[2px]">
                        ({restaurant.totalRatings || 0})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-pink-50 text-pink-500 text-xs px-2 py-1 rounded-full">
                    {restaurant.cuisineType}
                  </span>
                  {restaurant.priceRange && (
                    <span className="text-gray-500 text-sm">
                      {Array(restaurant.priceRange).fill("$").join("")}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs md:text-sm mb-2 normal-case md:capitalize font-semibold">
                  {restaurant.address?.street}, {restaurant.address?.city}
                </p>
                <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-medium text-gray-500 font-sans">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
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
