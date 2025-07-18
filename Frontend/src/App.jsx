// src/App.jsx
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/Auth/auth-context";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Screens/Home";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";
import ContactUs from "./components/ContactUs/ContactUs";
import Profile from "./components/UserProfile/Profile";
import AuthModal from "./components/Auth/AuthModal";
import RestaurantDetails from "./components/RestaurantDetails/RestaurantDetails";
import MenuItemDetail from "./components/MenuItemDetail/MenuItemDetail";
import Cart from "./components/Cart/Cart";
import Checkout from "./components/Checkout/Checkout";
import OrderTracking from "./components/OrderTracking/OrderTracking";
import OrderHistory from "./components/OrderHistory";
import { Toaster } from "react-hot-toast";
import VoiceGreeting from "./components/VoiceGreeting";
import './styles/voiceInteraction.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AuthModal />
        <Toaster position="top-right" />
        <VoiceGreeting />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/menu-item/:id" element={<MenuItemDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
