const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  cuisineType: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  openingHours: {
    monday: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    },
    tuesday: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    },
    wednesday: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    },
    thursday: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    },
    friday: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    },
    saturday: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    },
    sunday: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    }
  },
  images: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  deliveryRadius: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrder: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ cuisineType: 1 });
restaurantSchema.index({ 'address.city': 1 });
restaurantSchema.index({ rating: -1 });

// Add virtual field for reviews
restaurantSchema.virtual('reviews', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'restaurantId',
  match: { 
    'rating.score': { $exists: true, $ne: null },
    status: 'delivered'
  }
});

// Add virtual field for average rating
restaurantSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, order) => acc + order.rating.score, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Ensure virtuals are included in JSON
restaurantSchema.set('toJSON', { virtuals: true });
restaurantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Restaurant', restaurantSchema); 