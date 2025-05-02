const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, checkRole } = require('../middleware/auth');
const {
    createOrder,
    getUserOrders,
    getRestaurantOrders,
    getDriverOrders,
    updateOrderStatus,
    assignDriver,
    rateOrder
} = require('../controllers/orderController');

// Validation middleware
const orderValidation = [
    body('restaurantId').isMongoId().withMessage('Invalid restaurant ID'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.menuItem').isMongoId().withMessage('Invalid menu item ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('deliveryType').isIn(['take_away', 'delivery']).withMessage('Invalid delivery type'),
    body('deliveryAddress.street').if(body('deliveryType').equals('delivery')).trim().notEmpty().withMessage('Street address is required'),
    body('deliveryAddress.city').if(body('deliveryType').equals('delivery')).trim().notEmpty().withMessage('City is required'),
    body('deliveryAddress.state').if(body('deliveryType').equals('delivery')).trim().notEmpty().withMessage('State is required'),
    body('deliveryAddress.zipCode').if(body('deliveryType').equals('delivery')).trim().notEmpty().withMessage('Zip code is required'),
    body('deliveryAddress.country').if(body('deliveryType').equals('delivery')).trim().notEmpty().withMessage('Country is required'),
    body('deliveryAddress.coordinates').if(body('deliveryType').equals('delivery')).isArray().withMessage('Coordinates must be an array'),
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'cash']).withMessage('Invalid payment method')
];

const orderStatusValidation = [
    body('status').isIn([
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'picked_up',
        'on_delivery',
        'delivered',
        'cancelled'
    ]).withMessage('Invalid order status')
];

const ratingValidation = [
    body('food').isFloat({ min: 1, max: 5 }).withMessage('Food rating must be between 1 and 5'),
    body('delivery').isFloat({ min: 1, max: 5 }).withMessage('Delivery rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
];

// User routes
router.post('/', 
    auth, 
    checkRole(['user']), 
    orderValidation, 
    createOrder
);

router.get('/my-orders', 
    auth, 
    checkRole(['user']), 
    getUserOrders
);

// Restaurant routes
router.get('/restaurant/:restaurantId', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    getRestaurantOrders
);

router.put('/:id/status', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    orderStatusValidation, 
    updateOrderStatus
);

// Driver routes
router.get('/driver/orders', 
    auth, 
    checkRole(['driver']), 
    getDriverOrders
);

router.put('/:id/assign-driver', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    body('driverId').isMongoId().withMessage('Invalid driver ID'), 
    assignDriver
);

// Rating route
router.post('/:id/rate', 
    auth, 
    checkRole(['user']), 
    ratingValidation, 
    rateOrder
);

module.exports = router; 