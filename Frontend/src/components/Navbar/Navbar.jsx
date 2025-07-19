import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../Auth/auth-context";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { ShoppingCart, User, X, Menu } from "lucide-react";
import logo from "../../assets/vite.svg";
import IC from "../../assets/ic-rider-icon.svg";
import PropTypes from "prop-types";
const ChopsticksLogo = () => (
  <img src={IC} alt="chopsticks" className="w-10 h-10 md:w-12 md:h-12" />
);

const PandaLogo = () => (
  <img
    src={logo}
    alt="panda"
    className="w-12 md:w-16 transition-all duration-300"
  />
);

const MobileNavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-all rounded-lg"
  >
    {children}
  </Link>
);

MobileNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();
  const navbarOpacity = useTransform(scrollY, [0, 50], [1, 0.98]);
  const navbarHeight = useTransform(scrollY, [0, 20], ["4rem", "4.4rem"]);
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
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItemCount(cartItems.length);
    };

    loadCartItems();
    window.addEventListener("storage", loadCartItems);
    window.addEventListener("cartUpdated", loadCartItems);

    return () => {
      window.removeEventListener("storage", loadCartItems);
      window.removeEventListener("cartUpdated", loadCartItems);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setIsScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const navbarVariants = {
    top: {
      backgroundColor: "rgba(255, 255, 255, 1)",
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    },
    scrolled: {
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
  };


  return (
    <motion.nav
      className="relative z-50 bg-white"
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
            className="hidden w-full bg-gradient-to-r from-pink-500 to-pink-400 py-3 px-4 relative"
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-4 lg:gap-6 w-full justify-center">
              <div className="flex items-center gap-3 flex-col lg:flex-row text-center lg:text-left">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChopsticksLogo />
                </motion.div>
                <span className="text-white font-bold text-base lg:text-lg whitespace-nowrap">
                  Do you need a business account?
                </span>
              </div>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
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
        className="max-w-7xl mx-auto px-4 lg:px-8 py-3 bg-white shadow-md relative"
        style={{ height: navbarHeight }}
      >
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <motion.div style={{ scale: logoScale }} className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-1">
              <PandaLogo />
              <motion.span
                className="text-pink-500 text-xl lg:text-3xl font-bold"
                initial={{ opacity: 1 }}
                whileHover={{ color: "#db2777" }}
              >
                KHANA
              </motion.span>
            </Link>
          </motion.div>

          {/* Cart icon for mobile - Always visible */}
          <div className="flex items-center gap-4 lg:hidden">
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

            {/* Mobile menu button */}
            <motion.button
              className="text-gray-600 p-2 rounded-md hover:bg-pink-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              whileHover={{ backgroundColor: "#fdf2f8" }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-6">

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
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-pink-500">
                  {user.profileImage ? (
                    <img
                      src={`https://khana-backend-88zs.onrender.com${user.profileImage}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-pink-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center border-2 border-pink-100">
                      <User size={16} className="text-pink-400" />
                    </div>
                  )}
                  <span>{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-[100]">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                  >
                    Order History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                  >
                    Logout
                  </button>
                </div>
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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-xl lg:hidden z-50 w-full mt-1 border-t border-gray-100"
            >
              <div className="py-2">
                {/* User section for mobile */}
                {user ? (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      {user.profileImage ? (
                        <img
                          src={`https://khana-backend-88zs.onrender.com${user.profileImage}`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border-2 border-pink-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center border-2 border-pink-100">
                          <User size={20} className="text-pink-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                    <button
                      onClick={() => {
                        window.authModal.showLogin();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all text-left"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        window.authModal.showSignup();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all text-center font-medium"
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="py-2 px-2 space-y-1">
                  {/* Voice Assistant Button for Mobile */}
                  <div className="px-4 py-2">
                    {/* <VoiceAssistantButton /> */}
                  </div>

                  {user && (
                    <>
                      <MobileNavLink
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        Profile
                      </MobileNavLink>
                      <MobileNavLink
                        to="/orders"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Order History
                      </MobileNavLink>
                    </>
                  )}

                  <MobileNavLink
                    to="/privacy"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Privacy Policy
                  </MobileNavLink>

                  <MobileNavLink
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Contact Us
                  </MobileNavLink>
                </div>

                {/* Logout for mobile */}
                {user && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
            className="absolute top-24 right-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 py-4 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Welcome back, {user.name}!</p>
                <p className="text-sm opacity-90">
                  Lets get started with your next meal.
                </p>
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

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Navbar;
