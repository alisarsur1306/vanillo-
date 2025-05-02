const Restaurant = require('../models/Restaurant');
const { validationResult } = require('express-validator');

// Create a new restaurant
const createRestaurant = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const restaurant = new Restaurant({
            ...req.body,
            owner: req.user._id
        });

        await restaurant.save();

        res.status(201).json({
            success: true,
            restaurant
        });
    } catch (error) {
        console.error('Create restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating restaurant'
        });
    }
};

// Get all restaurants with optional filters
const getRestaurants = async (req, res) => {
    try {
        const { cuisine, city, rating, isActive } = req.query;
        const filter = {};

        if (cuisine) filter.cuisine = cuisine;
        if (city) filter['address.city'] = city;
        if (rating) filter.rating = { $gte: parseFloat(rating) };
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const restaurants = await Restaurant.find(filter)
            .populate('owner', 'name email phone')
            .select('-menu');

        res.json({
            success: true,
            restaurants
        });
    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurants'
        });
    }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
            .populate('owner', 'name email phone');

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.json({
            success: true,
            restaurant
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurant'
        });
    }
};

// Update restaurant
const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found or unauthorized'
            });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'owner') { // Prevent owner field from being updated
                restaurant[key] = req.body[key];
            }
        });

        await restaurant.save();

        res.json({
            success: true,
            restaurant
        });
    } catch (error) {
        console.error('Update restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating restaurant'
        });
    }
};

// Delete restaurant
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        console.error('Delete restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting restaurant'
        });
    }
};

// Add menu item
const addMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found or unauthorized'
            });
        }

        restaurant.menu.push(req.body);
        await restaurant.save();

        res.status(201).json({
            success: true,
            menuItem: restaurant.menu[restaurant.menu.length - 1]
        });
    } catch (error) {
        console.error('Add menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding menu item'
        });
    }
};

// Update menu item
const updateMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found or unauthorized'
            });
        }

        const menuItem = restaurant.menu.id(req.params.menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        Object.keys(req.body).forEach(key => {
            menuItem[key] = req.body[key];
        });

        await restaurant.save();

        res.json({
            success: true,
            menuItem
        });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating menu item'
        });
    }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found or unauthorized'
            });
        }

        const menuItem = restaurant.menu.id(req.params.menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        menuItem.remove();
        await restaurant.save();

        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting menu item'
        });
    }
};

module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
}; 