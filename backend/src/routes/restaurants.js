const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, checkRole } = require('../middleware/auth');
const {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/restaurantController');

// Validation middleware
const restaurantValidation = [
    body('name').trim().notEmpty().withMessage('Restaurant name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('cuisine').isArray().withMessage('Cuisine must be an array'),
    body('address.street').trim().notEmpty().withMessage('Street address is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('address.zipCode').trim().notEmpty().withMessage('Zip code is required'),
    body('address.country').trim().notEmpty().withMessage('Country is required'),
    body('address.coordinates').isArray().withMessage('Coordinates must be an array'),
    body('contact.phone').trim().notEmpty().withMessage('Phone number is required'),
    body('contact.email').isEmail().withMessage('Valid email is required')
];

const menuItemValidation = [
    body('name').trim().notEmpty().withMessage('Item name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be a positive number')
];

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes (restaurant owners only)
router.post('/', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    restaurantValidation, 
    createRestaurant
);

router.put('/:id', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    restaurantValidation, 
    updateRestaurant
);

router.delete('/:id', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    deleteRestaurant
);

// Menu item routes
router.post('/:id/menu', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    menuItemValidation, 
    addMenuItem
);

router.put('/:id/menu/:menuItemId', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    menuItemValidation, 
    updateMenuItem
);

router.delete('/:id/menu/:menuItemId', 
    auth, 
    checkRole(['restaurant_owner', 'admin']), 
    deleteMenuItem
);

module.exports = router; 