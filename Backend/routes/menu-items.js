const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/auth');
const MenuItem = require('../models/MenuItem');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/menu-items';
    // Create directory if it doesn't exist
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

// Get all menu items for a restaurant
router.get('/restaurant/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItems = await MenuItem.find({ restaurantId: id, isAvailable: true })
      .populate('restaurantId', 'name');

    // Add restaurant name to each menu item
    const response = menuItems.map(item => {
      const menuItem = item.toObject();
      menuItem.restaurantName = item.restaurantId.name;
      return menuItem;
    });
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id).populate('restaurantId', 'name');
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Add restaurant name to the response
    const response = menuItem.toObject();
    response.restaurantName = menuItem.restaurantId.name;
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all menu items for a seller
router.get('/seller/items', verifyToken, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurantId: req.user.restaurantId });
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new menu item
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const menuItemData = {
      ...req.body,
      restaurantId: req.body.restaurantId
    };

    // Add image path if image was uploaded
    if (req.file) {
      menuItemData.image = `/uploads/menu-items/${req.file.filename}`;
    }

    // Parse arrays that come as strings
    if (req.body.ingredients) {
      menuItemData.ingredients = JSON.parse(req.body.ingredients);
    }
    if (req.body.tags) {
      menuItemData.tags = JSON.parse(req.body.tags);
    }
    if (req.body.variations) {
      menuItemData.variations = JSON.parse(req.body.variations);
    }

    const menuItem = new MenuItem(menuItemData);
    const savedItem = await menuItem.save();
    res.status(201).json({
      message: 'Menu item created successfully',
      item: savedItem
    });
  } catch (err) {
    // Delete uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update a menu item
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Add image path if image was uploaded
    if (req.file) {
      updateData.image = `/uploads/menu-items/${req.file.filename}`;
      
      // Delete old image if it exists
      const menuItem = await MenuItem.findById(id);
      if (menuItem && menuItem.image) {
        const oldImagePath = path.join(__dirname, '..', menuItem.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      }
    }

    // Parse arrays that come as strings
    if (req.body.ingredients) {
      updateData.ingredients = JSON.parse(req.body.ingredients);
    }
    if (req.body.tags) {
      updateData.tags = JSON.parse(req.body.tags);
    }
    if (req.body.variations) {
      updateData.variations = JSON.parse(req.body.variations);
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      message: 'Menu item updated successfully',
      item: updatedItem
    });
  } catch (err) {
    // Delete uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// Delete a menu item
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Delete the image file if it exists
    if (menuItem.image) {
      const imagePath = path.join(__dirname, '..', menuItem.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    await menuItem.deleteOne();
    res.json({
      message: 'Menu item deleted successfully',
      id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle menu item availability
router.patch('/:id/availability', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();
    
    res.json({
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      item: menuItem
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;