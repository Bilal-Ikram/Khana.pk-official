const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    trim: true
  },
  variations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  preparationTime: {
    type: Number,
    min: 0,
    default: 15
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
menuItemSchema.index({ restaurantId: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });

// Add virtual field for reviews
menuItemSchema.virtual('reviews', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'items.menuItemId',
  match: { 
    'rating.score': { $exists: true, $ne: null },
    status: 'delivered'
  }
});

// Add virtual field for average rating
menuItemSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, order) => acc + order.rating.score, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Ensure virtuals are included in JSON
menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema); 