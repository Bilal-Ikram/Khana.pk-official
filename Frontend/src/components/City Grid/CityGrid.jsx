import  { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";

const CityGrid = () => {
  const [loadingCity, setLoadingCity] = useState(null);

  const cities = [
    {
      name: "Karachi",
      description: "City of Lights",
      imageUrl:
        "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Karachi.jpg?width=720",
      linkUrl: "https://karachi.gov.pk",
    },
    {
      name: "Lahore",
      description: "Heart of Pakistan",
      imageUrl:
        "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Lahore.jpg?width=720",
      linkUrl: "https://lahore.gov.pk",
    },
    {
      name: "Islamabad",
      description: "Capital City",
      imageUrl:
        "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Islamabad.jpg?width=720",
      linkUrl: "https://islamabad.gov.pk",
    },
    {
      name: "Faisalabad",
      description: "Manchester of Pakistan",
      imageUrl: "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Faisalabad.jpg?width=720",
      linkUrl: "https://faisalabad.gov.pk",
    },
    {
      name: "Rawalpindi",
      description: "Twin City",
      imageUrl: "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Rawalpindi.jpg?width=720",
      linkUrl: "https://rawalpindi.gov.pk",
    },
    {
      name: "Abbottabad",
      description: "City of Saints",
      imageUrl:
        "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-Abottabad.jpg?width=720",
      linkUrl: "https://abbottabad.gov.pk",
    },
    {
      name: "Bahawalpur",
      description: "City of Pearls",
      imageUrl:
        "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-Bahawalpur.jpg?width=720",
      linkUrl: "https://bahawalpur.gov.pk",
    },
    {
      name: "Dera Ghazi Khan",
      description: "City of Flowers",
      imageUrl:
        "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-DeraGhaziKhan.jpg?width=720",
      linkUrl: "https://deraghazikhan.gov.pk",
    },
    {
      name: "Gujranwala",
      description: "Fruit Garden of Pakistan",
      imageUrl:
        "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-Gujranwala.jpg?width=720",
      linkUrl: "https://gujranwala.gov.pk",
    },
    {
      name: "Gujrat",
      description: "City of Sports",
      imageUrl: "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-Gujrat.jpg.jpg?width=720",
      linkUrl: "https://gujrat.gov.pk",
    },
    {
      name: "Hyderabad",
      description: "City of Wrestlers",
      imageUrl: "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Hyderabad.jpg?width=720",
      linkUrl: "https://hyderabad.gov.pk",
    },
    {
      name: "Jhelum",
      description: "City of Eagles",
      imageUrl: "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-Jhelum.jpg?width=720",
      linkUrl: "https://jhelum.gov.pk",
    },
    {
      name: "Larkana",
      description: "City of Nawabs",
      imageUrl: "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-Larkana.jpg?width=720",
      linkUrl: "https://larkana.gov.pk",
    },
    {
      name: "Multan",
      description: "City of Saints",
      imageUrl: "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Multan.jpg?width=720",
      linkUrl: "https://multan.gov.pk",
    },
    {
      name: "Peshawar",
      description: "Second largest city in KPK",
      imageUrl: "https://images.deliveryhero.io/image/foodpanda/city-tile-pk/Peshawar.jpg?width=720",
      linkUrl: "https://peshawar.gov.pk",
    },
    {
      name: " Quetta",
      description: "Cultural center of Sindh",
      imageUrl: "https://images.deliveryhero.io/image/fd-pk/city-tile/city-tile-Quetta.jpg?width=720",
      linkUrl: "https://larkana.gov.pk",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Function to check if city has restaurants
  const checkCityRestaurants = async (city) => {
    try {
      setLoadingCity(city.name);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await axios.get(`${apiUrl}/api/restaurants`, {
        params: {
          city: city.name,
        },
      });

      if (response.data.length === 0) {
        // Show coming soon message
        toast.error(`Restaurants in ${city.name} coming soon!`, {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          },
        });
      } else {
        // Trigger location search event
        const searchEvent = new CustomEvent("locationSearch", {
          detail: { results: response.data, location: city.name },
        });
        document.dispatchEvent(searchEvent);

        // Scroll to restaurant list section
        setTimeout(() => {
          const restaurantSection =
            document.querySelector("#restaurantListing");
          if (restaurantSection) {
            restaurantSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error checking restaurants:", error);
      toast.error("Error checking restaurants. Please try again.");
    } finally {
      setLoadingCity(null);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="mx-auto">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-pink-500 mb-4 tracking-widest">
            DISCOVER FOOD IN PAKISTAN
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find us in these beautiful cities and many more across the country
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center p-8 "
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cities.map((city, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <img
                  onClick={() => checkCityRestaurants(city)}
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-full  object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                />
                <div className="absolute" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 px-2 py-2 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* <h3 className="text-xl font-bold mb-2">{city.name}</h3> */}
                  {/* <p className="text-gray-200">{city.description}</p> */}
                  <button
                    onClick={() => checkCityRestaurants(city)}
                    disabled={loadingCity === city.name}
                    className="px-4 py-2 bg-white text-[#2E3138] font-agrandir font-medium rounded-lg text-lg  leading-7 hover:bg-pink-600 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden text-ellipsis "
                  >
                    {loadingCity === city.name ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        {/* <MapPin className="w-4 h-4" /> */}
                        {city.name}
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 text-center"
        >
          <button className="bg-pink-500 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg">
            View All Cities
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CityGrid;
