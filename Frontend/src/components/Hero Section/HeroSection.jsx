import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import tacos from "../../assets/tacos.jpg";
import biryani from "../../assets/biryani.jpg";
const HeroSection = () => {
  const [locationInput, setLocationInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // List of major cities in Pakistan
  const majorCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi',
    'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot',
    'Gujranwala', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Larkana',
    'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Mardan', 'Gujrat'
  ];

  // Function to get location suggestions
  const getLocationSuggestions = (input) => {
    if (!input.trim()) {
      setLocationSuggestions([]);
      return;
    }

    const suggestions = majorCities.filter(city =>
      city.toLowerCase().includes(input.toLowerCase())
    );
    setLocationSuggestions(suggestions);
    setShowSuggestions(true);
  };

  // Function to handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    getLocationSuggestions(value);
  };

  // Function to select a location suggestion
  const selectLocation = (city) => {
    setLocationInput(city);
    setShowSuggestions(false);
    searchRestaurantsByLocation(city);
  };

  // Function to search restaurants by location
  const searchRestaurantsByLocation = async (location = locationInput) => {
    if (!location || !location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    try {
      setIsSearching(true);
      setSearchComplete(false);
      setErrorMessage('');
      setShowSuggestions(false);

      // Get the API URL from environment variables or use the default
      const apiUrl = import.meta.env.VITE_API_URL || 'https://khana-backend-88zs.onrender.com';
      
      // Call the backend API to search for restaurants in the specified location
      const response = await axios.get(`${apiUrl}/api/restaurants`, {
        params: {
          city: location.trim()
        }
      });

      // Set the search results
      setSearchResults(response.data);
      
      // Handle the case when no restaurants are found
      if (response.data.length === 0) {
        setErrorMessage(`No restaurants available in ${location}`);
        toast.error(`No restaurants available in ${location}`);
      } else {
        toast.success(`Found ${response.data.length} restaurants in ${location}`);
        
        // Trigger an event that the Home component can listen to
        const searchEvent = new CustomEvent('locationSearch', {
          detail: { results: response.data, location: location }
        });
        document.dispatchEvent(searchEvent);

        // Scroll to restaurant list section
        setTimeout(() => {
          const restaurantSection = document.querySelector('#restaurantListing');
          if (restaurantSection) {
            restaurantSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error searching for restaurants:', error);
      setErrorMessage('Error searching for restaurants. Please try again.');
      toast.error('Error searching for restaurants. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setSearchComplete(true);
    }
  };

  return (
    <div className="relative min-h-[200px] md:min-h-96">
  <div className="relative w-full h-[200px] md:min-h-[436px] bg-[#f4f5f5] overflow-hidden mx-auto">
    {/* Three-part flex layout */}
    <div className="flex w-full h-full min-h-[200px] md:min-h-[436px]">
      
      {/* Left biryani image part - hidden on tablet and mobile */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <div 
          className="w-full h-full bg-[#f4f5f5] bg-no-repeat bg-contain bg-center"
          style={{ backgroundImage: `url(${biryani})` }}
        ></div>
      </div>

      {/* Central content part - responsive sizing */}
      <div className="flex-2 md:flex-[2] lg:flex-[2] xl:flex-[2] relative flex flex-col items-center justify-center px-0 md:px-3 z-20">
        <div className="w-full max-w-4xl">
          
          {/* Mobile layout - fixed container with specific dimensions */}
          <div className="md:hidden">
            <div className={`w-full mx-auto bg-[#f4f5f5] ${searchComplete && errorMessage ? 'min-h-[200px]' : 'h-[200px]'} flex flex-col justify-center md:px-4 md:py-4 transition-all duration-300`}>
                  <div className="flex items-center justify-between ">
                    <div className='py-4 px-6'>
                <div className="w-full   flex items-center">
                  <h1 className="text-[#2E3138] font-poppins leading-[1.33] text-lg font-black text-left">
                    Sign up for free delivery on your first order
                  </h1>
                      </div>
                      </div>
                <div className="flex-1  flex justify-center mt-12 mr-2">
                  <div 
                    className="w-[163px] h-[159.9px] bg-[#f4f5f5] bg-no-repeat bg-contain bg-center"
                    style={{ backgroundImage: `url(${tacos})` }}
                  ></div>
                </div>
              </div>
              
              {/* Search results message - show when search is complete */}
              {searchComplete && errorMessage && (
                <div className="mt-4 p-3 bg-white/95 rounded-lg shadow-lg">
                  <p className="text-red-500 text-center text-sm">{errorMessage}</p>
                  <p className="text-gray-700 text-center mt-2 text-sm">
                    Please try searching in a different location or city.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tablet and Desktop layout */}
          <div className="hidden md:block text-center">
            <h1 className="text-[#2E3138] font-agrandir font-black leading-[1.33] text-[1.5rem] md:text-[2rem] xl:text-[2rem] mb-6 md:text-left">
              Sign up for free delivery on your first order
            </h1>
            
            {/* Search Bar */}
            <motion.div 
              className="flex flex-col gap-4 md:flex-row max-w-2xl md:max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative flex-[2] md:flex-[3] lg:flex-[4] xl:flex-[5]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your delivery location"
                  className="w-full pl-6 pr-4 py-4 text-gray-700 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-base"
                  value={locationInput}
                  onChange={handleLocationInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && searchRestaurantsByLocation()}
                  onFocus={() => setShowSuggestions(true)}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-pink-500 hover:text-pink-600 transition-colors"
                  onClick={() => searchRestaurantsByLocation()}
                  disabled={isSearching}
                >
                  <Search className="w-6 h-6" />
                </button>

                {/* Location Suggestions */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    {locationSuggestions.map((city, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-2 text-left hover:bg-pink-50 flex items-center gap-2"
                        onClick={() => selectLocation(city)}
                      >
                        <MapPin className="w-4 h-4 text-pink-500" />
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <motion.button 
                className="flex-2 px-3 py-2 font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-lg shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => searchRestaurantsByLocation()}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Find Food'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>

          {/* Search results message - show when search is complete */}
          {searchComplete && errorMessage && (
            <motion.div
              className="mt-8 p-4 bg-white/95 rounded-lg shadow-lg max-w-2xl mx-auto hidden md:block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-red-500 text-center">{errorMessage}</p>
              <p className="text-gray-700 text-center mt-2">
                Please try searching in a different location or city.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right tacos image part - visible on tablet and up */}
      <div className="hidden md:flex md:flex-1 relative">
        <div 
          className="w-full h-full bg-[#f4f5f5] bg-no-repeat bg-contain bg-center"
          style={{ backgroundImage: `url(${tacos})` }}
        ></div>
      </div>
    </div>
  </div>
  
  {/* Mobile search bar - outside the main container */}
  <div className="md:hidden px-4 mt-6">
    <motion.div 
      className="flex flex-col gap-4 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="w-4 h-4 text-gray-400" aria-label="Location icon" />
        </div>
        <input
          type="text"
          placeholder="Enter your delivery location"
          aria-label="Enter your delivery location"
          className="w-full pl-10 pr-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm shadow-lg"
          value={locationInput}
          onChange={handleLocationInputChange}
          onKeyPress={(e) => e.key === 'Enter' && searchRestaurantsByLocation()}
          onFocus={() => setShowSuggestions(true)}
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-pink-500 hover:text-pink-600 transition-colors"
          onClick={() => searchRestaurantsByLocation()}
          disabled={isSearching}
          aria-label="Search for restaurants"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Location Suggestions */}
        {showSuggestions && locationSuggestions.length > 0 && (
          <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
            {locationSuggestions.map((city, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-pink-50 flex items-center gap-2"
                onClick={() => selectLocation(city)}
              >
                <MapPin className="w-4 h-4 text-pink-500" />
                {city}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Mobile button - full width */}
      <motion.button 
        className="w-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => searchRestaurantsByLocation()}
        disabled={isSearching}
        aria-label="Find food near you"
      >
        {isSearching ? 'Searching...' : 'Find Food'}
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  </div>
</div>

);
};

export default HeroSection; 
