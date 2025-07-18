const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Restaurant = require('../models/Restaurant');
const { requireAuth } = require('../middleware/auth');
const { isRestaurantOwner } = require('../middleware/restaurantOwner');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/restaurants';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.city) {
      filter['address.city'] = { $regex: req.query.city, $options: 'i' };
    }
    const restaurants = await Restaurant.find(filter);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get restaurant by owner
router.get('/owner', requireAuth, async (req, res) => {
  try {
    console.log('Fetching restaurant for user:', req.user.id);
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      console.error('Restaurant not found for user:', req.user.id);
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    console.log('Found restaurant:', restaurant._id);
    res.json(restaurant);
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create restaurant
router.post('/owner', requireAuth, upload.array('images', 5), async (req, res) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ owner: req.user.id });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'You already have a restaurant' });
    }

    const restaurantData = {
      ...req.body,
      owner: req.user.id,
      openingHours: JSON.parse(req.body.openingHours || '{}'),
      address: JSON.parse(req.body.address || '{}')
    };

    if (req.files && req.files.length > 0) {
      restaurantData.images = req.files.map(file => `/uploads/restaurants/${file.filename}`);
    }

    const restaurant = new Restaurant(restaurantData);
    const savedRestaurant = await restaurant.save();
    res.status(201).json(savedRestaurant);
  } catch (err) {
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update restaurant
router.put('/owner', requireAuth, upload.array('images', 5), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const updateData = {
      ...req.body,
      openingHours: JSON.parse(req.body.openingHours || '{}'),
      address: JSON.parse(req.body.address || '{}')
    };

    if (req.files && req.files.length > 0) {
      if (restaurant.images && restaurant.images.length > 0) {
        restaurant.images.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          fs.unlink(fullPath, (err) => {
            if (err) console.error('Error deleting old image:', err);
          });
        });
      }
      updateData.images = req.files.map(file => `/uploads/restaurants/${file.filename}`);
    }

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedRestaurant);
  } catch (err) {
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// Delete restaurant
router.delete('/owner', requireAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.images && restaurant.images.length > 0) {
      restaurant.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        fs.unlink(fullPath, (err) => {
          if (err) console.error('Error deleting image:', err);
        });
      });
    }

    await restaurant.deleteOne();
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name'
        },
        options: { 
          sort: { 'rating.createdAt': -1 },
          limit: 50
        }
      });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).json({ message: 'Error fetching restaurant details' });
  }
});

// Search restaurants endpoint
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    // Create search query
    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } }, // Case-insensitive search in name
        { cuisineType: { $regex: q, $options: 'i' } }, // Case-insensitive search in cuisine
        { 'address.city': { $regex: q, $options: 'i' } }, // Search in city
        { description: { $regex: q, $options: 'i' } } // Search in description if available
      ]
    };

    const restaurants = await Restaurant.find(searchQuery)
      .limit(parseInt(limit))
      .select('name cuisineType address images rating totalRatings featured')
      .sort({ rating: -1, featured: -1 }); // Sort by rating and featured status

    res.json(restaurants);
  } catch (error) {
    console.error('Restaurant search error:', error);
    res.status(500).json({ error: 'Failed to search restaurants' });
  }
});

// Advanced search with filters
router.get('/search/advanced', async (req, res) => {
  try {
    const { 
      q, 
      cuisine, 
      city, 
      minRating = 0, 
      featured, 
      priceRange,
      limit = 20,
      page = 1 
    } = req.query;
    
    let searchQuery = {};
    
    // Text search
    if (q && q.trim().length > 0) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { cuisineType: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Cuisine filter
    if (cuisine && cuisine !== 'All Categories') {
      searchQuery.cuisineType = cuisine;
    }
    
    // City filter
    if (city) {
      searchQuery['address.city'] = { $regex: city, $options: 'i' };
    }
    
    // Rating filter
    if (minRating > 0) {
      searchQuery.rating = { $gte: parseFloat(minRating) };
    }
    
    // Featured filter
    if (featured === 'true') {
      searchQuery.featured = true;
    }
    
    // Price range filter (assuming you have a priceRange field)
    if (priceRange) {
      searchQuery.priceRange = priceRange;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search with pagination
    const [restaurants, totalCount] = await Promise.all([
      Restaurant.find(searchQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .select('name cuisineType address images rating totalRatings featured priceRange')
        .sort({ rating: -1, featured: -1, name: 1 }),
      Restaurant.countDocuments(searchQuery)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    res.json({
      restaurants,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Failed to perform advanced search' });
  }
});

// Get search suggestions (for autocomplete)
router.get('/suggestions', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    
    let suggestions = [];
    
    if (type === 'restaurants' || type === 'all') {
      // Get restaurant name suggestions
      const restaurantSuggestions = await Restaurant.find({
        name: { $regex: q, $options: 'i' }
      })
      .limit(5)
      .select('name cuisineType rating address')
      .sort({ rating: -1 });
      
      suggestions.push(...restaurantSuggestions.map(restaurant => ({
        type: 'restaurant',
        value: restaurant.name,
        data: {
          id: restaurant._id,
          name: restaurant.name,
          cuisineType: restaurant.cuisineType,
          rating: restaurant.rating,
          city: restaurant.address?.city
        }
      })));
    }
    
    if (type === 'cuisines' || type === 'all') {
      // Get unique cuisine suggestions
      const cuisineSuggestions = await Restaurant.distinct('cuisineType', {
        cuisineType: { $regex: q, $options: 'i' }
      });
      
      suggestions.push(...cuisineSuggestions.slice(0, 3).map(cuisine => ({
        type: 'cuisine',
        value: cuisine,
        data: { cuisine }
      })));
    }
    
    if (type === 'cities' || type === 'all') {
      // Get city suggestions
      const citySuggestions = await Restaurant.distinct('address.city', {
        'address.city': { $regex: q, $options: 'i' }
      });
      
      suggestions.push(...citySuggestions.slice(0, 3).map(city => ({
        type: 'city',
        value: city,
        data: { city }
      })));
    }
    
    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get popular searches
router.get('/popular', async (req, res) => {
  try {
    // Get most popular cuisines
    const popularCuisines = await Restaurant.aggregate([
      { $group: { _id: '$cuisineType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { cuisine: '$_id', count: 1, _id: 0 } }
    ]);
    
    // Get most popular cities
    const popularCities = await Restaurant.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { city: '$_id', count: 1, _id: 0 } }
    ]);
    
    // Get featured restaurants
    const featuredRestaurants = await Restaurant.find({ featured: true })
      .limit(3)
      .select('name cuisineType rating')
      .sort({ rating: -1 });
    
    res.json({
      popularCuisines,
      popularCities,
      featuredRestaurants
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ error: 'Failed to get popular searches' });
  }
});

// Search filters options
router.get('/filters', async (req, res) => {
  try {
    // Get all unique cuisines
    const cuisines = await Restaurant.distinct('cuisineType');
    
    // Get all unique cities
    const cities = await Restaurant.distinct('address.city');
    
    // Get price ranges (if available)
    const priceRanges = await Restaurant.distinct('priceRange');
    
    // Get rating ranges
    const ratingStats = await Restaurant.aggregate([
      {
        $group: {
          _id: null,
          minRating: { $min: '$rating' },
          maxRating: { $max: '$rating' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    
    res.json({
      cuisines: cuisines.sort(),
      cities: cities.sort(),
      priceRanges: priceRanges.sort(),
      ratingStats: ratingStats[0] || { minRating: 0, maxRating: 5, avgRating: 0 }
    });
  } catch (error) {
    console.error('Filters error:', error);
    res.status(500).json({ error: 'Failed to get filter options' });
  }
});


module.exports = router;