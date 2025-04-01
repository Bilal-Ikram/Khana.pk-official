const Restaurant = require('../models/Restaurant');

exports.isRestaurantOwner = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User is not authorized to perform this action' });
    }

    req.restaurant = restaurant;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 