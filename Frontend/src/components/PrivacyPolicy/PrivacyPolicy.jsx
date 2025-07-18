import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Lock, Shield, ExternalLink, Mail, Phone, MapPin, Clock, CheckCircle, MessageCircle, HelpCircle, Users, FileText, Eye, Key, Database, User, MessageSquare, Send } from 'lucide-react';
import Footer from '../Footer/Footer';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(null);
  const mainTitleControls = useAnimation();
  const contentControls = useAnimation();
  const ctaControls = useAnimation();
  
  // Intersection Observer setup for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '-50px'
    };
    
    const mainTitleObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        mainTitleControls.start('visible');
      }
    }, observerOptions);
    
    const contentObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        contentControls.start('visible');
      }
    }, observerOptions);
    
    const ctaObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        ctaControls.start('visible');
      }
    }, observerOptions);
    
    const mainTitleElement = document.getElementById('main-title-section');
    const contentElement = document.getElementById('content-section');
    const ctaElement = document.getElementById('cta-section');
    
    if (mainTitleElement) mainTitleObserver.observe(mainTitleElement);
    if (contentElement) contentObserver.observe(contentElement);
    if (ctaElement) ctaObserver.observe(ctaElement);
    
    return () => {
      if (mainTitleElement) mainTitleObserver.unobserve(mainTitleElement);
      if (contentElement) contentObserver.unobserve(contentElement);
      if (ctaElement) ctaObserver.unobserve(ctaElement);
    };
  }, [mainTitleControls, contentControls, ctaControls]);

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const TitleWithBackground = ({ icon, title, subtitle, controls }) => (
    <motion.div
      variants={titleVariants}
      initial="hidden"
      animate={controls}
      className="relative mb-12 text-center mt-6 p-8"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
          className="text-8xl text-pink-500"
        >
          {icon}
        </motion.div>
      </div>
      <motion.div className="relative z-10">
        <motion.div className="inline-block relative">
          <motion.h1 className="text-4xl font-bold mb-2">
            {title}
          </motion.h1>
          <motion.div 
            className="h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.div>
        <motion.p className="text-gray-600 max-w-2xl mx-auto mt-4">
          {subtitle}
        </motion.p>
      </motion.div>
    </motion.div>
  );

  const privacySections = [
    {
      icon: <Database size={24} />,
      title: "Information We Collect",
      content: [
        "Account Information: Name, email, phone number, and password",
        "Profile Information: Delivery addresses and preferences",
        "Order Information: Food items, restaurant choices, payment details",
        "Location Data: For restaurant discovery and delivery",
        "Device Information: IP address, browser type, and OS"
      ]
    },
    {
      icon: <Eye size={24} />,
      title: "How We Use Your Information",
      content: [
        "Processing orders and facilitating deliveries",
        "Improving our platform and services",
        "Providing customer support",
        "Sending promotional offers (with consent)",
        "Protecting against fraud and unauthorized access"
      ]
    },
    {
      icon: <Key size={24} />,
      title: "Data Security",
      content: [
        "Industry-standard encryption protocols",
        "Secure data storage and transmission",
        "Regular security audits and updates",
        "Access controls and authentication",
        "Employee data protection training"
      ]
    },
    {
      icon: <FileText size={24} />,
      title: "Your Rights",
      content: [
        "Access your personal data",
        "Correct inaccurate information",
        "Request data deletion",
        "Opt-out of marketing communications",
        "Export your data"
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Hero section with animated background */}
      <motion.div 
        className="w-full h-80 bg-cover bg-center relative mb-10"
        style={{
          backgroundImage: "url('/images/privacy-hero.jpg')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.7)"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-pink-900/80" />
        
        {/* Animated background patterns */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}
        />
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center flex-col text-center px-4"
          initial="hidden"
          animate={mainTitleControls}
          variants={titleVariants}
        >
          <motion.div 
            variants={titleVariants}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 bg-white/20 blur-2xl rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <Lock className="text-white h-20 w-20 mb-6 mx-auto relative z-10" />
          </motion.div>
          <motion.h1 
            className="text-6xl font-bold text-white mb-4 relative z-10"
            variants={titleVariants}
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            className="text-white text-xl max-w-2xl mx-auto relative z-10"
            variants={titleVariants}
          >
            Protecting your data is our priority
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Title Section */}
        <div id="main-title-section">
          <TitleWithBackground
            icon={<Shield size={300} />}
            title="OUR PRIVACY COMMITMENT"
            subtitle="At Khana.pk, we value your privacy and are committed to protecting your personal information."
            controls={mainTitleControls}
          />
        </div>

        {/* Content Sections */}
        <motion.div 
          id="content-section"
          className="grid md:grid-cols-2 gap-8"
          variants={contentVariants}
          initial="hidden"
          animate={contentControls}
        >
          {privacySections.map((section, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden"
              variants={contentVariants}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
            >
              {/* Decorative background elements */}
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full -mr-16 -mt-16"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full -ml-12 -mb-12"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -180, -360]
                }}
                transition={{ duration: 25, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-100 p-2 rounded-full text-pink-500 mr-3">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <motion.li 
                      key={idx}
                      className="flex items-start"
                      variants={contentVariants}
                    >
                      <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-600">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Information Section */}
        <motion.div 
          id="contact-section"
          className="mt-20 bg-white p-8 rounded-lg shadow-md relative overflow-hidden"
          variants={contentVariants}
          initial="hidden"
          animate={contentControls}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <div className="bg-pink-100 p-2 rounded-full text-pink-500 mr-3">
                  <MessageCircle size={20} />
                </div>
                Contact Our Privacy Team
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Mail size={20} />, text: "privacy@khana.pk", label: "Email us" },
                  { icon: <Phone size={20} />, text: "+92-XXX-XXXXXXX", label: "Call us" },
                  { icon: <MapPin size={20} />, text: "[Your Company Address], Pakistan", label: "Visit us" },
                  { icon: <Clock size={20} />, text: "Monday-Friday: 9AM-5PM PST", label: "Business hours" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    variants={contentVariants}
                  >
                    <div className="bg-pink-100 p-3 rounded-full text-pink-500 mr-4">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="font-medium">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg relative overflow-hidden">
              {/* Decorative background elements */}
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full -ml-12 -mb-12"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -180, -360]
                }}
                transition={{ duration: 25, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full text-white mr-3">
                    <MessageCircle size={20} />
                  </div>
                  Send us a message
                </h3>
                <form className="space-y-6">
                  <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        id="name" 
                        placeholder="Your full name"
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email" 
                        id="email" 
                        placeholder="your.email@example.com"
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-gray-400">
                        <MessageSquare size={18} />
                      </div>
                      <textarea 
                        id="message" 
                        rows="5" 
                        placeholder="How can we help you?"
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                      Subscribe to our newsletter
                    </label>
                  </div>
                  
                  <motion.button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center">
                      <Send size={18} className="mr-2" />
                      Send Message
                    </span>
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA section */}
        <motion.div 
          id="cta-section"
          className="mt-20 w-full py-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg relative overflow-hidden"
          variants={contentVariants}
          initial="hidden"
          animate={ctaControls}
        >
          <motion.div 
            className="absolute top-0 left-0 w-40 h-40 bg-pink-500 rounded-full -ml-20 -mt-20 opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 30, repeat: Infinity }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              <Shield className="text-pink-500 h-16 w-16 mb-4 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Committed to Your Privacy</h2>
            <p className="text-gray-200 text-lg mb-8">
              At Khana.pk, we understand the importance of your privacy. We're dedicated to protecting 
              your personal information and ensuring a secure experience on our platform.
            </p>
            <motion.button 
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Our Privacy Team
            </motion.button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 