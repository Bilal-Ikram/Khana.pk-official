const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { verifyToken } = require('../controllers/auth');
const whatsappService = require('../services/whatsappService');

// Create a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Creating order with data:', req.body);
    console.log('User from token:', req.user);

    // Validate required fields
    const { items, totalAmount, deliveryDetails, paymentMethod, restaurantId, restaurantName } = req.body;
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    // Validate each item
    for (const item of items) {
      if (!item.menuItemId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({ 
          message: 'Each item must have menuItemId, name, price, and quantity',
          invalidItem: item
        });
      }
    }

    // Validate total amount
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    // Validate delivery details
    if (!deliveryDetails) {
      return res.status(400).json({ message: 'Delivery details are required' });
    }

    const { name, phone, address, city } = deliveryDetails;
    if (!name || !phone || !address || !city) {
      return res.status(400).json({ 
        message: 'Delivery details must include name, phone, address, and city',
        receivedDetails: deliveryDetails
      });
    }

    // Validate payment method
    if (!paymentMethod || !['cod', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ 
        message: 'Invalid payment method. Must be either "cod" or "card"',
        receivedMethod: paymentMethod
      });
    }

    // Validate restaurant
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    if (!restaurantName) {
      return res.status(400).json({ message: 'Restaurant name is required' });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ 
        message: 'Restaurant not found',
        restaurantId
      });
    }

    // Create order data
    const orderData = {
      user: req.user.id,
      restaurantId,
      restaurantName,
      items,
      totalAmount,
      deliveryDetails,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed'
      }]
    };

    console.log('Final order data:', orderData);

    // Create and save the order
    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Populate restaurant details in the response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('restaurantId', 'name phone email address');

    console.log('Order created successfully:', populatedOrder);

    // Send WhatsApp notification
    try {
      await whatsappService.sendOrderConfirmation(
        populatedOrder,
        deliveryDetails.phone // Use the phone number from delivery details
      );
      console.log('WhatsApp notification sent successfully');
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification:', whatsappError);
      // Don't fail the order creation if WhatsApp notification fails
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (err) {
    console.error('Error creating order:', err);
    // Check if it's a validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    // Check if it's a MongoDB error
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return res.status(400).json({ 
        message: 'Database error',
        error: err.message
      });
    }
    res.status(500).json({ 
      message: 'Failed to create order',
      error: err.message 
    });
  }
});

// Get order by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // Initial validation
    if (!req.params.id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Log request details
    console.log('GET Order Request:', {
      orderId: req.params.id,
      userId: req.user?.id,
      userRole: req.user?.role,
      headers: {
        auth: !!req.headers.authorization
      }
    });

    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid order ID format',
        receivedId: req.params.id
      });
    }

    // Validate user authentication
    if (!req.user?.id) {
      console.error('Missing user authentication:', { 
        user: req.user,
        headers: {
          auth: !!req.headers.authorization
        }
      });
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find basic order first
    let order;
    try {
      order = await Order.findById(req.params.id).lean();
      console.log('Order lookup result:', {
        orderId: req.params.id,
        found: !!order,
        orderData: order ? {
          id: order._id?.toString(),
          userId: order.user?.toString(),
          restaurantId: order.restaurantId?.toString(),
          status: order.status
        } : null
      });
    } catch (findError) {
      console.error('Error finding order:', {
        error: findError.message,
        stack: findError.stack,
        orderId: req.params.id
      });
      return res.status(500).json({
        message: 'Database error while finding order',
        error: findError.message
      });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate required order fields
    if (!order.user || !order.restaurantId) {
      console.error('Invalid order data:', {
        orderId: order._id?.toString(),
        hasUser: !!order.user,
        hasRestaurantId: !!order.restaurantId
      });
      return res.status(500).json({
        message: 'Invalid order data',
        details: 'Order is missing required fields'
      });
    }

    // Find restaurant details
    let restaurant;
    try {
      restaurant = await Restaurant.findById(order.restaurantId).lean();
      console.log('Restaurant lookup result:', {
        restaurantId: order.restaurantId?.toString(),
        found: !!restaurant,
        restaurantData: restaurant ? {
          id: restaurant._id?.toString(),
          ownerId: restaurant.owner?.toString(),
          hasOwner: !!restaurant.owner,
          name: restaurant.name
        } : null
      });
    } catch (restaurantError) {
      console.error('Error finding restaurant:', {
        error: restaurantError.message,
        stack: restaurantError.stack,
        restaurantId: order.restaurantId?.toString()
      });
      return res.status(500).json({
        message: 'Database error while finding restaurant',
        error: restaurantError.message
      });
    }

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Handle missing restaurant owner more gracefully
    if (!restaurant.owner) {
      console.error('Restaurant missing owner:', {
        restaurantId: restaurant._id?.toString(),
        restaurantName: restaurant.name,
        orderUser: order.user?.toString()
      });
      
      // If the requesting user is the order owner, allow them to view it
      if (req.user.id.toString() === order.user.toString()) {
        // Proceed with order data but skip owner validation
        try {
          const populatedOrder = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('restaurantId', 'name phone email address')
            .lean();

          if (!populatedOrder) {
            return res.status(404).json({ message: 'Order details not found' });
          }

          // Process the order data safely
          const processedOrder = {
            ...populatedOrder,
            _id: populatedOrder._id?.toString(),
            user: populatedOrder.user ? {
              ...populatedOrder.user,
              _id: populatedOrder.user._id?.toString()
            } : null,
            restaurantId: populatedOrder.restaurantId ? {
              ...populatedOrder.restaurantId,
              _id: populatedOrder.restaurantId._id?.toString()
            } : null,
            items: (populatedOrder.items || []).map(item => ({
              ...item,
              _id: item._id?.toString(),
              menuItemId: item.menuItemId?.toString()
            }))
          };

          console.log('Sending processed order (customer only):', {
            orderId: processedOrder._id,
            status: processedOrder.status,
            authorized: true,
            hasUser: !!processedOrder.user,
            hasRestaurant: !!processedOrder.restaurantId,
            isCustomerView: true
          });

          return res.json(processedOrder);
        } catch (error) {
          console.error('Error processing customer order:', {
            error: error.message,
            stack: error.stack,
            orderId: req.params.id
          });
          return res.status(500).json({
            message: 'Error processing order data',
            error: error.message
          });
        }
      } else {
        // If not the order owner, return an error
        return res.status(500).json({
          message: 'Invalid restaurant data',
          details: 'Restaurant configuration issue. Please contact support.'
        });
      }
    }

    // Convert IDs to strings safely
    const requestUserId = req.user.id?.toString();
    const orderUserId = order.user?.toString();
    const restaurantOwnerId = restaurant.owner?.toString();

    // Validate all IDs are present
    if (!requestUserId || !orderUserId || !restaurantOwnerId) {
      console.error('Missing required IDs:', {
        hasRequestUserId: !!requestUserId,
        hasOrderUserId: !!orderUserId,
        hasRestaurantOwnerId: !!restaurantOwnerId
      });
      return res.status(500).json({
        message: 'Invalid data',
        details: 'Missing required ID information'
      });
    }

    console.log('Authorization check:', {
      requestUserId,
      orderUserId,
      restaurantOwnerId,
      isCustomer: requestUserId === orderUserId,
      isOwner: requestUserId === restaurantOwnerId
    });

    // Check authorization
    if (requestUserId !== orderUserId && requestUserId !== restaurantOwnerId) {
      return res.status(403).json({ 
        message: 'Not authorized to view this order',
        details: 'You must be either the customer or the restaurant owner'
      });
    }

    // If authorized, populate and return order details
    try {
      const populatedOrder = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('restaurantId', 'name phone email address owner')
        .lean();

      if (!populatedOrder) {
        return res.status(404).json({ message: 'Order details not found' });
      }

      // Process the order data safely
      const processedOrder = {
        ...populatedOrder,
        _id: populatedOrder._id?.toString(),
        user: populatedOrder.user ? {
          ...populatedOrder.user,
          _id: populatedOrder.user._id?.toString()
        } : null,
        restaurantId: populatedOrder.restaurantId ? {
          ...populatedOrder.restaurantId,
          _id: populatedOrder.restaurantId._id?.toString(),
          owner: populatedOrder.restaurantId.owner?.toString()
        } : null,
        items: (populatedOrder.items || []).map(item => ({
          ...item,
          _id: item._id?.toString(),
          menuItemId: item.menuItemId?.toString()
        }))
      };

      console.log('Sending processed order:', {
        orderId: processedOrder._id,
        status: processedOrder.status,
        authorized: true,
        hasUser: !!processedOrder.user,
        hasRestaurant: !!processedOrder.restaurantId
      });

      res.json(processedOrder);
    } catch (error) {
      console.error('Error processing order:', {
        error: error.message,
        stack: error.stack,
        orderId: req.params.id
      });
      return res.status(500).json({
        message: 'Error processing order data',
        error: error.message
      });
    }
  } catch (err) {
    console.error('Unhandled error in order fetch:', {
      error: err.message,
      stack: err.stack,
      orderId: req.params.id,
      userId: req.user?.id
    });
    res.status(500).json({
      message: 'Failed to fetch order details',
      error: err.message
    });
  }
});

// Get orders for a restaurant
router.get('/restaurant/:restaurantId', verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.query;

    console.log('Fetching restaurant orders:', {
      restaurantId,
      status,
      userId: req.user?.id,
      userRole: req.user?.role
    });

    // Validate restaurant ID format
    if (!restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid restaurant ID format',
        receivedId: restaurantId
      });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.error('Restaurant not found:', restaurantId);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Build query
    const query = { restaurantId };
    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('Fetching orders with query:', query);

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();

    console.log(`Found ${orders.length} orders for restaurant ${restaurantId}`);

    // Process the orders to ensure all IDs are strings
    const processedOrders = orders.map(order => ({
      ...order,
      _id: order._id?.toString(),
      user: order.user ? {
        ...order.user,
        _id: order.user._id?.toString()
      } : null,
      restaurantId: order.restaurantId?.toString(),
      items: order.items.map(item => ({
        ...item,
        _id: item._id?.toString(),
        menuItemId: item.menuItemId?.toString()
      }))
    }));
    
    res.json(processedOrders);
  } catch (err) {
    console.error('Error fetching restaurant orders:', {
      error: err.message,
      stack: err.stack,
      restaurantId: req.params.restaurantId
    });
    res.status(500).json({ 
      message: 'Failed to fetch orders',
      error: err.message 
    });
  }
});

// Get orders for a user
router.get('/user/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    console.log('Updating order status:', {
      orderId: id,
      newStatus: status,
      userId: req.user?._id || req.user?.id,
      userRole: req.user?.role
    });

    // Validate status
    const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses
      });
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      console.error('Order not found:', id);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) {
      console.error('Restaurant not found for order:', {
        orderId: id,
        restaurantId: order.restaurantId
      });
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Convert IDs to strings for comparison
    const requestUserId = (req.user?._id || req.user?.id)?.toString();
    const restaurantOwnerId = restaurant.owner?.toString();

    console.log('Authorization check:', {
      requestUserId,
      restaurantOwnerId,
      orderId: id,
      restaurantId: restaurant._id?.toString(),
      match: requestUserId === restaurantOwnerId,
      userRole: req.user?.role
    });

    // Verify restaurant ownership
    if (!requestUserId || !restaurantOwnerId) {
      console.error('Missing user or restaurant owner ID:', {
        hasUserId: !!requestUserId,
        hasOwnerId: !!restaurantOwnerId,
        userRole: req.user?.role
      });
      return res.status(403).json({ 
        message: 'Not authorized to update this order',
        details: 'Authentication error'
      });
    }

    if (requestUserId !== restaurantOwnerId) {
      console.error('User is not restaurant owner:', {
        requestUserId,
        restaurantOwnerId,
        orderId: id,
        userRole: req.user?.role
      });
      return res.status(403).json({ 
        message: 'Not authorized to update this order',
        details: 'You must be the restaurant owner'
      });
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    // If order is delivered, update payment status for COD
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'completed';
    }

    const updatedOrder = await order.save();

    // Send WhatsApp notification for status updates
    try {
      await whatsappService.sendOrderStatusUpdate(
        updatedOrder,
        order.deliveryDetails.phone
      );
      console.log('WhatsApp notification sent successfully for order:', id);
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification:', whatsappError);
      // Don't fail the status update if WhatsApp notification fails
    }

    console.log('Order status updated successfully:', {
      orderId: id,
      newStatus: status,
      userId: requestUserId,
      userRole: req.user?.role
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error updating order status:', {
      error: err.message,
      stack: err.stack,
      orderId: req.params.id,
      userId: req.user?._id || req.user?.id,
      userRole: req.user?.role
    });
    res.status(500).json({ 
      message: 'Failed to update order status',
      error: err.message 
    });
  }
});

// Add rating and review
router.post('/:id/rating', async (req, res) => {
  try {
    const { id } = req.params;
    const { stars, review } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow rating if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only rate delivered orders' });
    }

    // Only allow rating once
    if (order.rating && order.rating.stars) {
      return res.status(400).json({ message: 'Order already rated' });
    }

    order.rating = {
      stars,
      review,
      timestamp: new Date()
    };

    // Update restaurant rating
    const restaurant = await Restaurant.findById(order.restaurantId);
    const newTotalRatings = restaurant.totalRatings + 1;
    const newRating = (restaurant.rating * restaurant.totalRatings + stars) / newTotalRatings;
    
    await Restaurant.findByIdAndUpdate(order.restaurantId, {
      rating: newRating,
      totalRatings: newTotalRatings
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get seller's order statistics
router.get('/seller/stats', verifyToken, async (req, res) => {
  try {
    // Get seller's restaurant using the standardized ID format
    const userId = req.user.id;
    if (!userId) {
      console.error('No user ID found in token:', req.user);
      return res.status(401).json({ message: 'Invalid user token' });
    }

    console.log('Fetching restaurant for user:', userId);
    const restaurant = await Restaurant.findOne({ owner: userId });
    if (!restaurant) {
      console.error('Restaurant not found for user:', userId);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    console.log('Found restaurant:', restaurant._id);
    // Get all orders for this restaurant
    const orders = await Order.find({ restaurantId: restaurant._id });
    console.log('Found orders:', orders.length);

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
        : 0,
      ordersByStatus: {
        pending: orders.filter(order => order.status === 'pending').length,
        confirmed: orders.filter(order => order.status === 'confirmed').length,
        preparing: orders.filter(order => order.status === 'preparing').length,
        ready: orders.filter(order => order.status === 'ready').length,
        outForDelivery: orders.filter(order => order.status === 'out_for_delivery').length,
        delivered: orders.filter(order => order.status === 'delivered').length,
        cancelled: orders.filter(order => order.status === 'cancelled').length
      },
      recentOrders: orders
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          customerName: order.deliveryDetails.name
        }))
    };

    console.log('Sending stats:', stats);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching seller stats:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;