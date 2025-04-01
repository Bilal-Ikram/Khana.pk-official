const express = require('express');
const router = express.Router();
const { signup, login, verifyToken, updateProfile } = require('../controllers/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Token verification endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Protected route to get current user details
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Profile update route
router.put('/profile', verifyToken, upload.single('profileImage'), updateProfile);

// Seller-specific routes
router.post('/seller/signup', (req, res, next) => {
  req.body.role = 'seller';
  next();
}, signup);

router.post('/seller/login', (req, res, next) => {
  req.body.role = 'seller';
  next();
}, login);

module.exports = router;