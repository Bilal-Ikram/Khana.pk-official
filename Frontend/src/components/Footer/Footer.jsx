import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" }
  ];

  const contactInfo = [
    { icon: <Mail className="w-5 h-5" />, text: "ibrahimkhokhartecs@gmail.com", label: "Email" },
    { icon: <Phone className="w-5 h-5" />, text: "+92-324-4361734", label: "Phone" },
    { icon: <MapPin className="w-5 h-5" />, text: "Lahore, Pakistan", label: "Address" },
    { icon: <Clock className="w-5 h-5" />, text: "24/7 Support", label: "Support Hours" }
  ];

  const quickLinks = [
    { text: "About Us", href: "#" },
    { text: "Our Story", href: "#" },
    { text: "How We Are Helping Restaurants", href: "#" },
    { text: "Privacy Policy", href: "#" },
    { text: "Terms and Conditions", href: "#" }
  ];

  const popularRestaurants = [
    'Frichicks', 'Cafe 101', 'The House of Pizza-Bahria', 
    'Biryani Master Thoker', 'Asghar Shinwari Restaurant'
  ];

  const popularCuisines = [
    'American', 'Asian', 'Beverages', 'Burgers', 'Cakes & Bakery',
    'Casual', 'Chinese', 'Deals', 'Desserts', 'European', 'Fast Food',
    'Fried Chicken', 'Greek', 'Healthy Food', 'International',
    'Italian', 'Mediterranean', 'Middle Eastern', 'Pakistani',
    'Pizza', 'Rice Bowl', 'Sandwiches', 'Seafood', 'Tea & Coffee',
    'Western'
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* Top Border with Gradient */}
      <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"></div>
      
      <div className="container mx-auto max-w-7xl px-8 md:px-16 lg:px-24 py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo and About Section */}
          <motion.div 
            className="col-span-1 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <img 
                src={logo} 
                alt="Khana.pk Logo" 
                className="w-48 hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Khana is the bridge between restaurants and customers. We are enabling customers to order directly from their favorite restaurants without paying any extra charges. Also, we are giving facilities to restaurants to create their web page and keep up to date with their menu so customers can order easily any time.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-4 text-gray-600 hover:text-pink-500 transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-pink-500 mt-1 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-sm">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Popular Restaurants */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-pink-500">Popular</span> Restaurants
            </h3>
            <div className="flex flex-wrap gap-3">
              {popularRestaurants.map((restaurant, index) => (
                <motion.span
                  key={restaurant}
                  className="bg-white text-pink-500 px-4 py-2 rounded-full text-sm hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {restaurant}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Popular Cuisine */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-pink-500">Popular</span> Cuisine
            </h3>
            <div className="flex flex-wrap gap-3">
              {popularCuisines.map((cuisine, index) => (
                <motion.span
                  key={cuisine}
                  className="bg-white text-pink-500 px-4 py-2 rounded-full text-sm hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {cuisine}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-pink-500">Quick</span> Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <a 
                    href={link.href} 
                    className="flex items-center gap-3 text-gray-600 hover:text-pink-500 transition-colors group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm">{link.text}</span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="pt-4">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-pink-500">Payment</span> Methods
              </h3>
              <motion.div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg inline-block shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                CASH ON DELIVERY
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Social Links */}
        <motion.div 
          className="flex justify-center gap-8 mt-16 pt-8 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-pink-500 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="text-pink-500 group-hover:text-white transition-colors">
                {social.icon}
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Copyright */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white py-5 rounded-lg font-medium shadow-lg">
            ©Copyright 2025. All Rights are Reserved by khana.pk. Reserved by Bilal Ikram & Muhammad Ibrahim
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 