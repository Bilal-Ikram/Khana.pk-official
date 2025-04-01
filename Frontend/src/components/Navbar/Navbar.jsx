import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../Auth/auth-context";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ShoppingCart, Languages, User, ChevronDown, X, Menu } from "lucide-react";
import logo from "../../assets/logo.png";
import IC from "../../assets/ic-rider-icon.svg";

const ChopsticksLogo = () => (
  <img src={IC} alt="chopsticks" className="w-10 h-10 md:w-12 md:h-12" />
);

const PandaLogo = () => (
  <img src={logo} alt="panda" className="w-12 md:w-16 transition-all duration-300" />
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { user, token, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  const navbarOpacity = useTransform(scrollY, [0, 50], [1, 0.98]);
  const navbarHeight = useTransform(scrollY, [0, 100], ["6rem", "4.5rem"]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  useEffect(() => {
    if (user) {
      setShowCongrats(true);
      const timer = setTimeout(() => setShowCongrats(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    const loadCartItems = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setCartItemCount(cartItems.length);
    };

    loadCartItems();
    window.addEventListener('storage', loadCartItems);
    window.addEventListener('cartUpdated', loadCartItems);

    return () => {
      window.removeEventListener('storage', loadCartItems);
      window.removeEventListener('cartUpdated', loadCartItems);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setIsScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    setIsDropdownOpen(false);
  };

  const navbarVariants = {
    top: { 
      backgroundColor: "rgba(255, 255, 255, 1)",
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    },
    scrolled: { 
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }
  };

  return (
    <motion.nav
      className=" z-50"
      style={{ opacity: navbarOpacity }}
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      variants={navbarVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Pink banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            className="w-full bg-gradient-to-r from-pink-500 to-pink-400 py-3 px-4 relative"
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-4 lg:gap-6 w-full justify-center">
              <div className="flex items-center gap-3 flex-col lg:flex-row text-center lg:text-left">
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.2 }}>
                  <ChopsticksLogo />
                </motion.div>
                <span className="text-white font-bold text-base lg:text-lg whitespace-nowrap">
                  Do you need a business account?
                </span>
              </div>
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="http://localhost:5175/"
                    target="_blank"
                    className="text-white rounded-lg font-medium hover:bg-white hover:text-pink-500 p-2 lg:p-3 transition-all duration-200 border-2 border-white w-full lg:w-auto ml-2"
                  >
                    SIGN UP NOW
                  </Link>
                </motion.div>
                <motion.button
                  onClick={() => setShowBanner(false)}
                  className="text-white hover:text-gray-200 transition-colors absolute right-2 top-2 lg:top-1/2 lg:-translate-y-1/2"
                  aria-label="Close banner"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main navbar */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 lg:px-8 py-3 bg-white shadow-md"
        style={{ height: navbarHeight }}
      >
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <motion.div style={{ scale: logoScale }}>
            <Link to="/" className="flex items-center gap-1">
              <PandaLogo />
              <motion.span 
                className="text-pink-500 text-2xl lg:text-3xl font-bold"
                initial={{ opacity: 1 }}
                whileHover={{ color: "#db2777" }}
              >
                KHANA
              </motion.span>
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <motion.button
            className="lg:hidden text-gray-600 p-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            whileHover={{ backgroundColor: "#f9f9f9" }}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/privacy">Privacy Policy</NavLink>
            <NavLink to="/contact">Contact Us</NavLink>
            
            {/* Language selector */}
            <div className="flex items-center gap-2 text-gray-600 group">
              <Languages className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
              <select className="bg-transparent border-none outline-none hover:text-pink-500 transition-colors cursor-pointer">
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
              </select>
            </div>

            {/* Cart link */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/cart" 
                className="relative text-gray-600 hover:text-pink-500 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span 
                      className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
            
            {/* Profile/Login section */}
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none rounded-full p-1 pr-2"
                  whileHover={{ backgroundColor: "#f5f5f5" }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-pink-100">
                    {user.profileImage ? (
                      <img
                        src={`http://localhost:3001${user.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-50">
                        <User className="w-5 h-5 text-pink-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">{user.name}</span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          <span>Logout</span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => window.authModal.showLogin()}
                  className="px-4 py-2 text-gray-600 hover:text-pink-500 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Log in
                </motion.button>
                <motion.button
                  onClick={() => window.authModal.showSignup()}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign up
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex flex-col gap-3 mt-4 pb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
              >
                <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink to="/privacy" onClick={() => setIsMenuOpen(false)}>Privacy Policy</MobileNavLink>
                <MobileNavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</MobileNavLink>
                
                <MobileNavLink to="/cart" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart {cartItemCount > 0 && `(${cartItemCount})`}</span>
                  </div>
                </MobileNavLink>
                
                {user ? (
                  <>
                    <MobileNavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </div>
                    </MobileNavLink>
                    <motion.button
                      onClick={handleLogout}
                      className="px-4 py-3 text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-colors text-left rounded-md w-full"
                      whileHover={{ backgroundColor: "#fdf2f8" }}
                    >
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Logout</span>
                      </div>
                    </motion.button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <motion.button
                      onClick={() => {
                        window.authModal.showLogin();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 text-gray-600 hover:text-pink-500 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left w-full"
                      whileHover={{ backgroundColor: "#f5f5f5" }}
                    >
                      Log in
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        window.authModal.showSignup();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-left w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign up
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Congratulatory message */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="fixed top-24 right-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-4 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Welcome back, {user.name}!</p>
                <p className="text-sm opacity-90">Let's get started with your next meal.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Custom NavLink component for desktop navigation
const NavLink = ({ to, children }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Link 
      to={to} 
      className="px-3 py-2 text-gray-600 hover:text-pink-500 transition-colors font-medium"
    >
      {children}
    </Link>
  </motion.div>
);

// Custom NavLink component for mobile navigation
const MobileNavLink = ({ to, children, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
  >
    <Link 
      to={to} 
      className="px-4 py-3 text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-colors block rounded-md"
      onClick={onClick}
    >
      {children}
    </Link>
  </motion.div>
);

export default Navbar;