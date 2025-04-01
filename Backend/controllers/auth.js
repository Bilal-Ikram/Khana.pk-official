const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

exports.signup = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address, 
      role, 
      businessName, 
      businessType, 
      taxId, 
      bankDetails 
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Validate address structure
    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      return res.status(400).json({ 
        message: 'Address must include street, city, state, and zipCode' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      role: role || 'customer'
    };

    // Add seller specific fields if role is seller
    if (role === 'seller') {
      if (!businessName || !businessType) {
        return res.status(400).json({ message: 'Business details are required for seller registration' });
      }
      userData.businessName = businessName;
      userData.businessType = businessType;
      userData.taxId = taxId;
      
      // Validate and add bank details if provided
      if (bankDetails) {
        userData.bankDetails = {
          accountHolder: bankDetails.accountHolder,
          accountNumber: bankDetails.accountNumber,
          bankName: bankDetails.bankName,
          branchCode: bankDetails.branchCode
        };
      }
    }

    // Create and save user
    const user = new User(userData);
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        ...(user.role === 'seller' && {
          businessName: user.businessName,
          businessType: user.businessType,
          taxId: user.taxId,
          bankDetails: user.bankDetails
        })
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if user has the required role
    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. User is not a ${role}` });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        ...(user.role === 'seller' && {
          businessName: user.businessName,
          businessType: user.businessType,
          taxId: user.taxId,
          bankDetails: user.bankDetails
        })
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Log user data for debugging
    console.log('User data in verifyToken:', {
      userId: user._id,
      userRole: user.role,
      decodedUserId: decoded.id
    });

    req.user = {
      ...user.toObject(),
      id: user._id
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, email } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic information
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (city) user.address.city = city;
    if (address) user.address.street = address;

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if it exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old profile image:', err);
        });
      }

      // Update profile image path
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Save the updated user
    await user.save();

    // Return updated user data
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};