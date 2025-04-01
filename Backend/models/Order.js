const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variation: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryDetails: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    notes: String
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  rating: {
    stars: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ 'deliveryDetails.phone': 1 });

module.exports = mongoose.model('Order', orderSchema); 