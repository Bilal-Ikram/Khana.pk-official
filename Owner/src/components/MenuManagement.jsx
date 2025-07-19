import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/auth-context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const MenuManagement = () => {
  const navigate = useNavigate();
  const { user, restaurant, token, refreshRestaurant } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: '',
    tags: '',
    isVegetarian: false,
    isSpicy: false,
    variations: [],
    image: null
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!token || !user) {
          navigate('/login');
          return;
        }

        // Refresh restaurant data
        await refreshRestaurant();

        if (!restaurant) {
          setError('You need to create a restaurant before you can manage the menu.');
          navigate('/seller/restaurant');
          return;
        }

        await fetchMenuItems();
      } catch (err) {
        console.error('Error initializing menu data:', err);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [token, user, restaurant, navigate, refreshRestaurant]);

  const fetchMenuItems = async () => {
    try {
      if (!restaurant?._id) {
        throw new Error('Restaurant ID is missing');
      }

      const response = await fetch(`https://khana-backend-88zs.onrender.com/api/menu-items/restaurant/${restaurant._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch menu items');
      }

      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      throw err;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      ingredients: '',
      tags: '',
      isVegetarian: false,
      isSpicy: false,
      variations: [],
      image: null
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingItem(null);
  };

  const handleAddNewItem = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditItem = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      ingredients: item.ingredients ? item.ingredients.join(', ') : '',
      tags: item.tags ? item.tags.join(', ') : '',
      isVegetarian: item.isVegetarian || false,
      isSpicy: item.isSpicy || false,
      variations: item.variations || [],
      image: item.image
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddVariation = () => {
    setFormData({
      ...formData,
      variations: [
        ...formData.variations,
        { name: '', price: '' }
      ]
    });
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...formData.variations];
    updatedVariations[index][field] = value;
    setFormData({
      ...formData,
      variations: updatedVariations
    });
  };

  const handleRemoveVariation = (index) => {
    const updatedVariations = formData.variations.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      variations: updatedVariations
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      if (!restaurant?._id) {
        throw new Error('Restaurant ID is missing');
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('restaurantId', restaurant._id);
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'ingredients' || key === 'tags') {
          const items = formData[key] ? formData[key].split(',').map(item => item.trim()) : [];
          formDataToSend.append(key, JSON.stringify(items));
        } else if (key === 'price') {
          formDataToSend.append(key, parseFloat(formData[key]));
        } else if (key === 'variations') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'image') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const url = editingItem 
        ? `http://localhost:3001/api/menu-items/${editingItem._id}`
        : 'http://localhost:3001/api/menu-items';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save menu item');
      }

      const message = editingItem ? 'Menu item updated successfully!' : 'Menu item created successfully!';
      setSuccess(message);
      toast.success(message);
      
      await fetchMenuItems();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving menu item:', err);
      const errorMessage = err.message || 'Failed to save menu item';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://khana-backend-88zs.onrender.com/api/menu-items/${itemId}/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item availability');
      }

      await fetchMenuItems();
      toast.success('Item availability updated successfully');
    } catch (err) {
      console.error('Error updating availability:', err);
      toast.error(err.message || 'Failed to update item availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      setLoading(true);

      const response = await fetch(`https://khana-backend-88zs.onrender.com/api/menu-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete menu item');
      }

      await fetchMenuItems();
      toast.success('Menu item deleted successfully');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      toast.error(err.message || 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=300&q=80';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Restaurant Required</h2>
        <p className="text-gray-600 mb-4">You need to create a restaurant before you can manage the menu.</p>
        <button
          onClick={() => navigate('/seller/restaurant')}
          className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Create Restaurant
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button
          onClick={handleAddNewItem}
          className="bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 transition-colors"
        >
          Add New Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Category</option>
                <option value="Appetizers">Appetizers</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Sides">Sides</option>
                <option value="Specials">Specials</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Ingredients (comma separated)</label>
                <input
                  type="text"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="e.g. Tomato, Cheese, Basil"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. Popular, New, Seasonal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVegetarian"
                  name="isVegetarian"
                  checked={formData.isVegetarian}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                />
                <label htmlFor="isVegetarian" className="ml-2 text-gray-700">Vegetarian</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSpicy"
                  name="isSpicy"
                  checked={formData.isSpicy}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                />
                <label htmlFor="isSpicy" className="ml-2 text-gray-700">Spicy</label>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700">Variations (optional)</label>
                <button
                  type="button"
                  onClick={handleAddVariation}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded-md transition-colors"
                >
                  + Add Variation
                </button>
              </div>
              
              {formData.variations.length > 0 && (
                <div className="space-y-2">
                  {formData.variations.map((variation, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={variation.name}
                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                        placeholder="Variation name"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <input
                        type="number"
                        value={variation.price}
                        onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                        placeholder="Price"
                        min="0"
                        step="0.01"
                        className="w-24 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Item Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                {editingItem ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu items list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {menuItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No menu items found. Add your first menu item to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.image ? (
                        <img
                          src={`http://localhost:3001${item.image}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = getDefaultImage();
                          }}
                        />
                      ) : (
                        <img
                          src={getDefaultImage()}
                          alt="Default"
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                      {item.variations && item.variations.length > 0 && (
                        <div className="text-xs text-gray-500">+ {item.variations.length} variations</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        {item.isAvailable ? 'Set Unavailable' : 'Set Available'}
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-pink-600 hover:text-pink-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagement; 
