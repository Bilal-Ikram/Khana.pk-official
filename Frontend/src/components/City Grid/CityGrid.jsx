import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CityGrid = () => {
  const [hoveredCity, setHoveredCity] = useState(null);
  
  // Updated city data with image URLs and link URLs
  const cities = [
    { 
      name: 'Islamabad', 
      description: 'The capital city',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1697729758639-d692c36557b2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://visitislamabad.gov.pk'
    },
    { 
      name: 'Karachi', 
      description: 'The largest metropolis',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1697730196206-7d8f455766bf?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://karachicity.gov.pk'
    },
    { 
      name: 'Lahore', 
      description: 'Cultural heart of Pakistan',
      imageUrl: 'https://images.unsplash.com/photo-1613768412322-0a6138a9bb6b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://lahore.gop.pk'
    },
    { 
      name: 'Faisalabad', 
      description: 'Industrial hub',
      imageUrl: 'https://images.unsplash.com/photo-1635602739175-bab409a6e94c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://faisalabad.gov.pk'
    },
    { 
      name: 'Rawalpindi', 
      description: 'Twin city of Islamabad',
      imageUrl: 'https://images.unsplash.com/photo-1614254613489-71538f7ae568?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://rwp.punjab.gov.pk'
    },
    { 
      name: 'Peshawar', 
      description: 'Gateway to the Khyber Pass',
      imageUrl: 'https://images.unsplash.com/photo-1567499477991-848a1cb9a337?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://peshawar.gov.pk'
    },
    { 
      name: 'Quetta', 
      description: 'Capital of Balochistan',
      imageUrl: 'https://images.unsplash.com/photo-1623746335279-299087cf398f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://quetta.gov.pk'
    },
    { 
      name: 'Multan', 
      description: 'City of Saints',
      imageUrl: 'https://images.unsplash.com/photo-1595422656453-db310c973901?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://multan.gop.pk'
    },
    { 
      name: 'Hyderabad', 
      description: 'Second largest city in Sindh',
      imageUrl: 'https://images.unsplash.com/photo-1563873011-7cbb78c3ab4e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://hyderabad.gov.pk'
    },
    { 
      name: 'Gujranwala', 
      description: 'City of wrestlers',
      imageUrl: 'https://images.unsplash.com/photo-1603502738504-be87b04c4f53?q=80&w=2061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://gujranwala.gop.pk'
    },
    { 
      name: 'Sialkot', 
      description: 'Sports goods manufacturing',
      imageUrl: 'https://images.unsplash.com/photo-1600417613469-12a66c7270af?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://sialkot.gov.pk'
    },
    { 
      name: 'Bahawalpur', 
      description: 'City of palaces',
      imageUrl: 'https://images.unsplash.com/photo-1585808184069-80709901b36d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://bahawalpur.gop.pk'
    },
    { 
      name: 'Sargodha', 
      description: 'Known for citrus fruits',
      imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://sargodha.gop.pk'
    },
    { 
      name: 'Abbottabad', 
      description: 'Mountain city',
      imageUrl: 'https://images.unsplash.com/photo-1631035701710-3cc7e0818ff4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://abbottabad.gov.pk'
    },
    { 
      name: 'Mardan', 
      description: 'Second largest city in KPK',
      imageUrl: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://mardan.gov.pk'
    },
    { 
      name: 'Larkana', 
      description: 'Cultural center of Sindh',
      imageUrl: 'https://images.unsplash.com/photo-1588685232180-8bb64cb4837a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      linkUrl: 'https://larkana.gov.pk'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Handle click on the explore button
  const handleExploreClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-pink-500 mb-4 tracking-widest">DISCOVER FOOD IN PAKISTAN</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find us in these beautiful cities and many more across the country</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cities.map((city, index) => (
            <motion.div
              key={city.name}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-pink-100"
            >
              <div className="relative h-52 overflow-hidden">
                {/* Use the actual image URL instead of placeholder */}
                <motion.img
                  src={city.imageUrl}
                  alt={`${city.name} city`}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/70 via-pink-400/30 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <motion.h2 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white font-bold text-xl"
                    >
                      {city.name}
                    </motion.h2>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: hoveredCity === city.name ? 1 : 0.8,
                  height: 'auto'
                }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-600">{city.description}</p>
                <button 
                  onClick={() => handleExploreClick(city.linkUrl)}
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors duration-300"
                >
                  Explore {city.name}
                </button>
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