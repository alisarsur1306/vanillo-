import { Router } from 'express';
import { checkSchema } from 'express-validator';
import {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/restaurant.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonValidationRules } from '../middleware/validate';
import { UserRole } from '../models';

const router = Router();

// Restaurant validation schemas
const createRestaurantSchema = {
  name: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Restaurant name is required',
  },
  description: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Description is required',
  },
  cuisine: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Cuisine type is required',
  },
  address: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Address is required',
  },
  phone: commonValidationRules.phone,
  email: commonValidationRules.email,
  openingHours: {
    in: ['body'],
    isString: true,
    notEmpty: true,
    errorMessage: 'Opening hours are required',
  },
  deliveryRadius: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Delivery radius must be a positive number',
    },
  },
  minimumOrder: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Minimum order must be a positive number',
    },
  },
  averageDeliveryTime: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Average delivery time must be a positive integer',
    },
  },
};

const updateRestaurantSchema = {
  name: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Restaurant name cannot be empty',
  },
  description: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Description cannot be empty',
  },
  cuisine: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Cuisine type cannot be empty',
  },
  address: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Address cannot be empty',
  },
  phone: {
    ...commonValidationRules.phone,
    optional: true,
  },
  email: {
    ...commonValidationRules.email,
    optional: true,
  },
  openingHours: {
    in: ['body'],
    optional: true,
    isString: true,
    notEmpty: true,
    errorMessage: 'Opening hours cannot be empty',
  },
  deliveryRadius: {
    in: ['body'],
    optional: true,
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Delivery radius must be a positive number',
    },
  },
  minimumOrder: {
    in: ['body'],
    optional: true,
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Minimum order must be a positive number',
    },
  },
  averageDeliveryTime: {
    in: ['body'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Average delivery time must be a positive integer',
    },
  },
};

const menuItemSchema = {
  name: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Item name is required',
  },
  description: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Description is required',
  },
  price: commonValidationRules.price,
  category: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Category is required',
  },
  preparationTime: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Preparation time must be a positive integer',
    },
  },
  isVegetarian: {
    in: ['body'],
    optional: true,
    isBoolean: true,
    errorMessage: 'isVegetarian must be a boolean',
  },
  isVegan: {
    in: ['body'],
    optional: true,
    isBoolean: true,
    errorMessage: 'isVegan must be a boolean',
  },
  isGlutenFree: {
    in: ['body'],
    optional: true,
    isBoolean: true,
    errorMessage: 'isGlutenFree must be a boolean',
  },
  spicyLevel: {
    in: ['body'],
    optional: true,
    isInt: {
      options: { min: 0, max: 5 },
      errorMessage: 'Spicy level must be between 0 and 5',
    },
  },
};

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', validate(checkSchema({ id: commonValidationRules.id })), getRestaurant);
router.get('/:id/menu', validate(checkSchema({ id: commonValidationRules.id })), getRestaurantMenu);

// Protected routes
router.use(authenticate);

// Restaurant owner routes
router.post(
  '/',
  authorize(UserRole.RESTAURANT),
  validate(checkSchema(createRestaurantSchema)),
  createRestaurant
);

router.patch(
  '/:id',
  authorize(UserRole.RESTAURANT),
  validate(checkSchema({ id: commonValidationRules.id, ...updateRestaurantSchema })),
  updateRestaurant
);

router.delete(
  '/:id',
  authorize(UserRole.RESTAURANT),
  validate(checkSchema({ id: commonValidationRules.id })),
  deleteRestaurant
);

// Menu item routes
router.post(
  '/:id/menu',
  authorize(UserRole.RESTAURANT),
  validate(checkSchema({ id: commonValidationRules.id, ...menuItemSchema })),
  addMenuItem
);

router.patch(
  '/:id/menu/:itemId',
  authorize(UserRole.RESTAURANT),
  validate(
    checkSchema({
      id: commonValidationRules.id,
      itemId: commonValidationRules.id,
      ...menuItemSchema,
    })
  ),
  updateMenuItem
);

router.delete(
  '/:id/menu/:itemId',
  authorize(UserRole.RESTAURANT),
  validate(
    checkSchema({
      id: commonValidationRules.id,
      itemId: commonValidationRules.id,
    })
  ),
  deleteMenuItem
);

export default router; 