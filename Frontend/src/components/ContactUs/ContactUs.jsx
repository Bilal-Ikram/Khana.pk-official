import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Mail, User, MessageSquare, Send, Phone, MapPin, Clock, CheckCircle, MessageCircle, HelpCircle, Users } from 'lucide-react';
import Footer from '../Footer/Footer';

const Contact = () => {
  const [result, setResult] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const mainTitleControls = useAnimation();
  const contactInfoControls = useAnimation();
  const formControls = useAnimation();
  const faqControls = useAnimation();
  
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
    
    const contactInfoObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        contactInfoControls.start('visible');
      }
    }, observerOptions);
    
    const formObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        formControls.start('visible');
      }
    }, observerOptions);
    
    const faqObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        faqControls.start('visible');
      }
    }, observerOptions);
    
    const mainTitleElement = document.getElementById('main-title-section');
    const contactInfoElement = document.getElementById('contact-info-section');
    const formElement = document.getElementById('form-section');
    const faqElement = document.getElementById('faq-section');
    
    if (mainTitleElement) mainTitleObserver.observe(mainTitleElement);
    if (contactInfoElement) contactInfoObserver.observe(contactInfoElement);
    if (formElement) formObserver.observe(formElement);
    if (faqElement) faqObserver.observe(faqElement);
    
    return () => {
      if (mainTitleElement) mainTitleObserver.unobserve(mainTitleElement);
      if (contactInfoElement) contactInfoObserver.unobserve(contactInfoElement);
      if (formElement) formObserver.unobserve(formElement);
      if (faqElement) faqObserver.unobserve(faqElement);
    };
  }, [mainTitleControls, contactInfoControls, formControls, faqControls]);
  
  const contactInfo = [
    { icon: <Phone size={20} />, text: "+1 (555) 123-4567", label: "Call us" },
    { icon: <Mail size={20} />, text: "contact@yourcompany.com", label: "Email us" },
    { icon: <MapPin size={20} />, text: "123 Business Street, Suite 101, New York, NY 10001", label: "Visit us" },
    { icon: <Clock size={20} />, text: "Monday-Friday: 9AM-5PM EST", label: "Business hours" }
  ];

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    setFormSubmitting(true);

    const formData = new FormData(event.target);

    // Append your Web3Forms access key
    formData.append("access_key", "244c51de-6f69-4f60-85d7-d8c011e9c9a3");

    try {
      // Send the form data to Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form Submitted Successfully");
        setShowSuccessModal(true); // Show the success modal
        event.target.reset(); // Reset the form after successful submission
      } else {
        console.log("Error", data);
        setResult(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setResult("An error occurred. Please try again later.");
    } finally {
      setFormSubmitting(false);
    }
  };

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

  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const formItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
      <motion.div
        className="relative z-10"
        variants={titleVariants}
      >
        <motion.div 
          className="inline-block relative"
          variants={titleVariants}
        >
          <motion.h1 
            className="text-4xl font-bold mb-2"
            variants={titleVariants}
          >
            {title}
          </motion.h1>
          <motion.div 
            className="h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.3, duration: 0.8 }}
          ></motion.div>
        </motion.div>
        <motion.p 
          className="text-gray-600 max-w-2xl mx-auto mt-4"
          variants={titleVariants}
        >
          {subtitle}
        </motion.p>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-12 mt-6">
        {/* Main Title Section */}
        <div id="main-title-section">
          <TitleWithBackground
            icon={<MessageCircle size={300} />}
            title="GET IN TOUCH"
            subtitle="Have questions or feedback? We'd love to hear from you. Fill out the form below, and our team will get back to you as soon as possible."
            controls={mainTitleControls}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 p-10">
          {/* Contact Information */}
          <motion.div 
            id="contact-info-section"
            className="bg-white shadow rounded-lg p-6 md:col-span-1 relative overflow-hidden"
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
            }}
            initial="hidden"
            animate={contactInfoControls}
          >
            {/* Background decorative elements */}
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
              <div className="flex items-center mb-6">
                <div className="bg-pink-100 p-2 rounded-full text-pink-500 mr-3">
                  <Users size={20} />
                </div>
                <h2 className="text-2xl font-semibold">Contact Information</h2>
              </div>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ delay: index * 0.1 + 0.2 }}
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

              <div className="mt-10">
                <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <motion.a 
                    href="#" 
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors"
                    whileHover={{ scale: 1.2, rotate: -10 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-colors"
                    whileHover={{ scale: 1.2, rotate: -10 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            id="form-section"
            className="bg-white shadow rounded-lg p-6 md:col-span-2 relative overflow-hidden"
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
            }}
            initial="hidden"
            animate={formControls}
          >
            {/* Background decorative elements */}
            <motion.div 
              className="absolute top-0 left-0 w-40 h-40 bg-pink-50 rounded-full -ml-20 -mt-20"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 30, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mb-16"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -180, -360]
              }}
              transition={{ duration: 25, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="bg-pink-100 p-2 rounded-full text-pink-500 mr-3">
                  <Mail size={20} />
                </div>
                <h2 className="text-2xl font-semibold">Send us a message</h2>
              </div>
              
              <motion.form 
                onSubmit={onSubmit} 
                className="space-y-6"
                variants={formContainerVariants}
              >
                <motion.div variants={formItemVariants}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <User size={18} />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      name="name"
                      id="name"
                      placeholder="John Doe"
                      className="w-full pl-10 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={formItemVariants}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Mail size={18} />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      name="email"
                      id="email"
                      placeholder="your.email@example.com"
                      className="w-full pl-10 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={formItemVariants}>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <MessageSquare size={18} />
                    </div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      name="subject"
                      id="subject"
                      placeholder="How can we help you?"
                      className="w-full pl-10 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={formItemVariants}>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-gray-500">
                      <MessageSquare size={18} />
                    </div>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      name="message"
                      id="message"
                      rows="5"
                      placeholder="Please provide details about your inquiry..."
                      className="w-full pl-10 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    ></motion.textarea>
                  </div>
                </motion.div>
                
                <div className="flex items-center">
                  <input
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                    Subscribe to our newsletter
                  </label>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variants={formItemVariants}
                >
                  {formSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send size={18} className="mr-2" />
                      Send Message
                    </span>
                  )}
                </motion.button>
              </motion.form>
              
              <span className="block mt-4 text-center text-gray-700">{result}</span>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div id="faq-section" className="mt-20">
          <TitleWithBackground
            icon={<HelpCircle size={300} />}
            title="FREQUENTLY ASKED QUESTIONS"
            subtitle="Find quick answers to common questions about our services and support"
            controls={faqControls}
          />
          
          <motion.div 
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            variants={formContainerVariants}
            initial="hidden"
            animate={faqControls}
          >
            {[
              {
                question: "How quickly can I expect a response?",
                answer: "We strive to respond to all inquiries within 24 business hours."
              },
              {
                question: "Do you offer support on weekends?",
                answer: "Our main support hours are Monday-Friday, but urgent matters are monitored 24/7."
              },
              {
                question: "Can I schedule a callback?",
                answer: "Yes! Just mention your preferred time in the message and we'll call you back."
              },
              {
                question: "How can I check the status of my inquiry?",
                answer: "You'll receive a reference number via email that you can use to track your inquiry."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-lg shadow text-left relative overflow-hidden"
                variants={formItemVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-pink-100 rounded-bl-3xl"></div>
                
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <span className="bg-pink-100 p-2 rounded-full text-pink-500 mr-3 flex-shrink-0">
                    <HelpCircle size={16} />
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-10">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setShowSuccessModal(false)} // Close modal on click outside
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
              {/* Decorative background elements */}
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-24 h-24 bg-pink-50 rounded-full -ml-12 -mb-12"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, -180, -360]
                }}
                transition={{ 
                  duration: 25, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 2 }}
                  >
                    <CheckCircle size={60} className="text-green-500" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for contacting us. We've received your message and will get back to you within 24 hours.
                </p>
                <motion.button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default Contact;