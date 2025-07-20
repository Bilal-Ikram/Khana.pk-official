import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  X,
  Minus,
  Plus
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      if (!Array.isArray(items)) {
        items = [];
        localStorage.setItem("cartItems", JSON.stringify([]));
      }
    } catch {
      items = [];
      localStorage.setItem("cartItems", JSON.stringify([]));
    }
    setCartItems(items);
    calculateTotal(items);
  }, []);

  const calculateTotal = (items) => {
    if (!Array.isArray(items)) items = [];
    const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    // Dispatch event for global cart updates
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
    setTotal(0);
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Cart cleared");
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return getDefaultImage();
    if (imagePath.startsWith("http")) return imagePath;
    return `https://khana-backend-88zs.onrender.com${imagePath}`;
  };

  const getDefaultImage = () => {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=300&q=80";
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 py-8"
        data-testid="khana-pk-empty-cart"
      >
        <div className="text-center py-16">
          <ShoppingBag
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            data-testid="empty-cart-icon"
          />
          <h2
            className="text-2xl font-bold mb-2"
            data-testid="empty-cart-title"
          >
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-4" data-testid="empty-cart-message">
            Add some delicious items to your cart
          </p>
          <Link
            to="/"
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            data-testid="browse-restaurants-link"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8"
      data-testid="khana-pk-main-container"
    >
      {/* Header */}
      <div
        className="flex justify-between items-center mb-8"
        data-testid="cart-header"
      >
        <h1
          className="text-2xl font-bold"
          data-testid="cart-title"
          data-voice-target="cart-title"
        >
          Shopping Cart
        </h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 flex items-center gap-2"
          data-testid="clear-cart-button"
          data-voice-target="clear-cart-button"
        >
          <Trash2 className="w-5 h-5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Cart Items Section */}
      <div
        className="bg-white rounded-lg shadow-md p-6 mb-8"
        data-testid="cart-items-section"
      >
        {/* Cart Item List */}
        {cartItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center py-4 border-b last:border-b-0"
            data-testid="cart-item"
            data-voice-target="cart-item"
          >
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = getDefaultImage();
              }}
              data-testid="cart-item-image"
            />

            <div className="flex-1 ml-4">
              <h3
                className="font-semibold"
                data-testid="cart-item-name"
                data-voice-target="cart-item-name"
              >
                {item.name}
              </h3>
              {item.variation && (
                <p
                  className="text-sm text-gray-500"
                  data-testid="cart-item-variation"
                >
                  Variation: {item.variation}
                </p>
              )}
              <p
                className="text-pink-500"
                data-testid="cart-item-price"
              >
                ${item.price.toFixed(2)}
              </p>
            </div>

            <div
              className="flex items-center gap-4"
              data-testid="cart-item-controls"
            >
              {/* Quantity Controls */}
              <div
                className="flex items-center border rounded-lg"
                data-testid="quantity-controls"
                data-voice-target="quantity-controls"
              >
                <button
                  className="px-3 py-1 text-pink-500 hover:bg-pink-50"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  data-testid="decrease-quantity-button"
                  data-voice-target="decrease-quantity-button"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span
                  className="px-3 py-1"
                  data-testid="cart-item-quantity"
                  data-voice-target="cart-item-quantity"
                >
                  {item.quantity}
                </span>
                <button
                  className="px-3 py-1 text-pink-500 hover:bg-pink-50"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                  data-testid="increase-quantity-button"
                  data-voice-target="increase-quantity-button"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Remove Item Button */}
              <button
                onClick={() => removeItem(index)}
                className="text-gray-400 hover:text-red-500"
                aria-label={`Remove ${item.name} from cart`}
                data-testid="remove-item-button"
                data-voice-target="remove-item-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Total & Checkout */}
        <div
          className="mt-6 pt-6 border-t"
          data-testid="cart-summary"
        >
          <div
            className="flex justify-between text-lg font-semibold mb-6"
            data-testid="cart-total"
          >
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={proceedToCheckout}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
            data-testid="checkout-button"
            data-voice-target="checkout-button"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Proceed to Checkout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;