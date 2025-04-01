const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
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
    const restaurants = await Restaurant.find({ isActive: true });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get restaurant by owner
router.get('/owner', auth, async (req, res) => {
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
router.post('/owner', auth, upload.array('images', 5), async (req, res) => {
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
router.put('/owner', auth, upload.array('images', 5), async (req, res) => {
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
router.delete('/owner', auth, async (req, res) => {
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

// Get restaurant by ID (should be last)
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;