import { Router } from 'express';
import { checkSchema } from 'express-validator';
import {
  createOrder,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus,
  assignDriver,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, commonValidationRules } from '../middleware/validate';
import { UserRole, OrderStatus } from '../models';

const router = Router();

// Order validation schemas
const createOrderSchema = {
  restaurantId: commonValidationRules.id,
  items: {
    in: ['body'],
    isArray: true,
    errorMessage: 'Items must be an array',
    custom: {
      options: (value: any[]) => value.length > 0,
      errorMessage: 'Order must contain at least one item',
    },
  },
  'items.*.menuItemId': {
    in: ['body'],
    isUUID: true,
    errorMessage: 'Invalid menu item ID',
  },
  'items.*.quantity': {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Quantity must be at least 1',
    },
  },
  'items.*.specialInstructions': {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
  },
  'items.*.customizations': {
    in: ['body'],
    optional: true,
    isObject: true,
  },
  deliveryAddress: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Delivery address is required',
  },
  specialInstructions: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
  },
  paymentMethod: {
    in: ['body'],
    isString: true,
    isIn: {
      options: [['credit_card', 'debit_card', 'paypal']],
      errorMessage: 'Invalid payment method',
    },
  },
};

const updateOrderStatusSchema = {
  id: commonValidationRules.id,
  status: {
    in: ['body'],
    isString: true,
    isIn: {
      options: [Object.values(OrderStatus)],
      errorMessage: 'Invalid order status',
    },
  },
};

// Protected routes
router.use(authenticate);

// Customer routes
router.post('/', authorize(UserRole.CUSTOMER), validate(checkSchema(createOrderSchema)), createOrder);
router.get('/my-orders', getUserOrders);

// Restaurant routes
router.get(
  '/restaurant/:restaurantId',
  authorize(UserRole.RESTAURANT),
  validate(checkSchema({ restaurantId: commonValidationRules.id })),
  getRestaurantOrders
);

// Order status updates
router.patch(
  '/:id/status',
  authorize(UserRole.RESTAURANT, UserRole.DRIVER),
  validate(checkSchema(updateOrderStatusSchema)),
  updateOrderStatus
);

// Driver routes
router.post(
  '/:orderId/assign-driver',
  authorize(UserRole.DRIVER),
  validate(checkSchema({ orderId: commonValidationRules.id })),
  assignDriver
);

export default router; 