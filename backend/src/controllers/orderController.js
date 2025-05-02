const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { validationResult } = require('express-validator');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { restaurantId, items, deliveryAddress, paymentMethod, deliveryType } = req.body;

        // Get restaurant to calculate delivery fee
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        // Calculate order totals
        const totalAmount = items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const tax = totalAmount * 0.1; // 10% tax
        const deliveryFee = deliveryType === 'delivery' ? restaurant.deliveryFee : 0;
        const grandTotal = totalAmount + tax + deliveryFee;

        const order = new Order({
            user: req.user._id,
            restaurant: restaurantId,
            items,
            totalAmount,
            deliveryFee,
            tax,
            grandTotal,
            paymentMethod,
            deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
            deliveryType
        });

        await order.save();

        // Emit socket event for real-time updates
        req.app.get('io').to(restaurantId).emit('newOrder', order);

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
};

// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('restaurant', 'name address')
            .populate('driver', 'name phone')
            .sort('-createdAt');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

// Get restaurant's orders
const getRestaurantOrders = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.restaurantId,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found or unauthorized'
            });
        }

        const orders = await Order.find({ restaurant: req.params.restaurantId })
            .populate('user', 'name phone')
            .populate('driver', 'name phone')
            .sort('-createdAt');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get restaurant orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

// Get driver's orders
const getDriverOrders = async (req, res) => {
    try {
        const orders = await Order.find({ driver: req.user._id })
            .populate('restaurant', 'name address')
            .populate('user', 'name phone')
            .sort('-createdAt');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get driver orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization based on user role
        if (req.user.role === 'restaurant_owner') {
            const restaurant = await Restaurant.findOne({
                _id: order.restaurant,
                owner: req.user._id
            });

            if (!restaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to update this order'
                });
            }

            // Restaurant can only update to certain statuses
            if (!['confirmed', 'preparing', 'ready_for_pickup'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status for restaurant'
                });
            }
        } else if (req.user.role === 'driver') {
            if (order.driver.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to update this order'
                });
            }

            // Driver can only update to certain statuses
            if (!['picked_up', 'on_delivery', 'delivered'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status for driver'
                });
            }
        }

        order.status = status;
        if (status === 'delivered') {
            order.actualDeliveryTime = new Date();
        }

        await order.save();

        // Emit socket event for real-time updates
        req.app.get('io').to(order.restaurant.toString()).emit('orderStatusUpdated', {
            orderId: order._id,
            status
        });

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
};

// Assign driver to order
const assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is ready for pickup
        if (order.status !== 'ready_for_pickup') {
            return res.status(400).json({
                success: false,
                message: 'Order is not ready for pickup'
            });
        }

        order.driver = driverId;
        order.status = 'picked_up';
        await order.save();

        // Emit socket event for real-time updates
        req.app.get('io').to(order.restaurant.toString()).emit('driverAssigned', {
            orderId: order._id,
            driverId
        });

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning driver'
        });
    }
};

// Rate order
const rateOrder = async (req, res) => {
    try {
        const { food, delivery, comment } = req.body;
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: 'delivered'
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or not eligible for rating'
            });
        }

        order.rating = {
            food,
            delivery,
            comment
        };

        await order.save();

        // Update restaurant rating
        const restaurant = await Restaurant.findById(order.restaurant);
        const restaurantOrders = await Order.find({
            restaurant: order.restaurant,
            'rating.food': { $exists: true }
        });

        const averageRating = restaurantOrders.reduce((total, order) => {
            return total + order.rating.food;
        }, 0) / restaurantOrders.length;

        restaurant.rating = averageRating;
        restaurant.totalRatings = restaurantOrders.length;
        await restaurant.save();

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Rate order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rating order'
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getRestaurantOrders,
    getDriverOrders,
    updateOrderStatus,
    assignDriver,
    rateOrder
}; 