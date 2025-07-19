import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Clock,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MenuItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const response = await fetch(`https://khana-backend-88zs.onrender.com/api/restaurants/api/menu-items/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu item');
        }
        const data = await response.json();
        console.log('Fetched menu item:', data);
        setMenuItem({
          ...data,
          restaurantName: data.restaurantId?.name || data.restaurantName
        });
        if (data.variations && data.variations.length > 0) {
          setSelectedVariation(data.variations[0]);
        }
      } catch (err) {
        setError('Failed to load menu item details');
        console.error('Error fetching menu item:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItem();
  }, [id]);

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=300&q=80';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return getDefaultImage();
    if (imagePath.startsWith('http')) return imagePath;
    return `https://khana-backend-88zs.onrender.com${imagePath}`;
  };

  const addToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

    // Check if item from different restaurant
    if (
      cartItems.length > 0 &&
      cartItems[0].restaurantId !== menuItem.restaurantId
    ) {
      if (
        window.confirm(
          `Your cart contains items from ${
            cartItems[0].restaurantName
          }. Would you like to clear your cart and add items from ${menuItem.restaurantName} instead?`
        )
      ) {
        // Clear cart and add new item
        const cartItem = {
          _id: menuItem._id,
          name: menuItem.name,
          price: selectedVariation ? selectedVariation.price : menuItem.price,
          image: menuItem.image,
          quantity: quantity,
          restaurantId: menuItem.restaurantId,
          restaurantName: menuItem.restaurantName,
          variation: selectedVariation ? selectedVariation.name : null
        };
        localStorage.setItem('cartItems', JSON.stringify([cartItem]));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Cart updated with new item!');
        navigate('/cart');
      } else {
        toast.info('You can only add items from one restaurant at a time');
      }
      return;
    }

    const cartItem = {
      _id: menuItem._id,
      name: menuItem.name,
      price: selectedVariation ? selectedVariation.price : menuItem.price,
      image: menuItem.image,
      quantity: quantity,
      restaurantId: menuItem.restaurantId,
      restaurantName: menuItem.restaurantName,
      variation: selectedVariation ? selectedVariation.name : null
    };

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item._id === cartItem._id &&
        item.variation === cartItem.variation
    );

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].quantity += quantity;
      toast.success('Item quantity updated in cart!');
    } else {
      cartItems.push(cartItem);
      toast.success('Item added to cart!');
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"
          data-testid="loading-spinner"
        ></div>
      </div>
    );
  }

  if (error || !menuItem) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Menu item not found'}</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8"
      data-testid="khana-pk-main-container"
    >
      {/* Menu Item Container */}
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        data-testid="menu-item"
        data-menu-id={menuItem._id}
      >
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2" data-testid="item-image-section">
            <img
              src={getImageUrl(menuItem.image)}
              alt={menuItem.name}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.src = getDefaultImage();
              }}
            />
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8">
            {/* Title */}
            <h1
              className="text-3xl font-bold mb-4"
              data-testid="item-name"
            >
              {menuItem.name}
            </h1>

            {/* Preparation Time */}
            <div
              className="flex items-center mb-4"
              data-testid="preparation-time"
            >
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              <span>{menuItem.preparationTime} mins preparation time</span>
            </div>

            {/* Description */}
            <p
              className="text-gray-600 mb-6"
              data-testid="item-description"
            >
              {menuItem.description}
            </p>

            {/* Ingredients */}
            {menuItem.ingredients && menuItem.ingredients.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-lg font-semibold mb-2"
                  data-testid="ingredients-title"
                >
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {menuItem.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      data-testid="ingredient-tag"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Variations */}
            {menuItem.variations && menuItem.variations.length > 0 ? (
              <div className="mb-6">
                <h3
                  className="text-lg font-semibold mb-2"
                  data-testid="variations-title"
                >
                  Variations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {menuItem.variations.map((variation) => (
                    <button
                      key={variation._id}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedVariation?.name === variation.name
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedVariation(variation)}
                      data-testid="variation-option"
                      data-variation={variation.name}
                    >
                      {variation.name} - ${variation.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p
                className="text-2xl font-bold mb-6"
                data-testid="item-price"
              >
                ${menuItem.price.toFixed(2)}
              </p>
            )}

            {/* Quantity Controls & Add to Cart Button */}
            <div
              className="flex items-center gap-4 mb-6"
              data-testid="quantity-and-cart"
            >
              {/* Quantity Buttons */}
              <div
                className="flex items-center border rounded-lg"
                data-testid="quantity-controls"
              >
                <button
                  className="px-4 py-2 text-pink-500 hover:bg-pink-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  className="px-4 py-2 text-pink-500 hover:bg-pink-50"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                className="flex-1 bg-pink-500 text-white py-2 px-6 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                data-testid="add-to-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Tags */}
            {menuItem.tags && menuItem.tags.length > 0 && (
              <div
                className="flex items-center gap-2 mb-4"
                data-testid="tags-section"
              >
                <Tag className="w-5 h-5 text-gray-500" />
                {menuItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    data-testid="tag-badge"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Additional Info Badges */}
            <div
              className="flex items-center gap-4 text-sm text-gray-500"
              data-testid="additional-info"
            >
              {menuItem.isVegetarian && (
                <span
                  className="flex items-center gap-1"
                  data-testid="vegetarian-badge"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Vegetarian
                </span>
              )}
              {menuItem.isSpicy && (
                <span
                  className="flex items-center gap-1"
                  data-testid="spicy-badge"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Spicy
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetail;
