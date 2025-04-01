import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
    setCartItems(items);
    calculateTotal(items);
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    setTotal(sum);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    // Dispatch custom event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    calculateTotal(updatedItems);
    // Dispatch custom event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    setTotal(0);
    // Dispatch custom event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Cart cleared');
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return getDefaultImage();
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=300&q=80';
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some delicious items to your cart</p>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {cartItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center py-4 border-b last:border-b-0"
          >
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => { e.target.src = getDefaultImage(); }}
            />
            
            <div className="flex-1 ml-4">
              <h3 className="font-semibold">{item.name}</h3>
              {item.variation && (
                <p className="text-sm text-gray-500">Variation: {item.variation}</p>
              )}
              <p className="text-pink-500">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  className="px-3 py-1 text-pink-500 hover:bg-pink-50"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                >
                  -
                </button>
                <span className="px-3 py-1">{item.quantity}</span>
                <button
                  className="px-3 py-1 text-pink-500 hover:bg-pink-50"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={proceedToCheckout}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 