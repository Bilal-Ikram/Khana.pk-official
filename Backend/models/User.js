const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  role: { 
    type: String, 
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  profileImage: { type: String },
  // Seller specific fields
  businessName: { type: String },
  businessType: { type: String },
  taxId: { type: String },
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    bankName: String,
    branchCode: String
  }
});

// Add index for email
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);