import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, commonValidationRules } from '../middleware/validate';

const router = Router();

// Registration validation schema
const registerSchema = {
  email: commonValidationRules.email,
  password: commonValidationRules.password,
  firstName: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'First name is required',
  },
  lastName: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Last name is required',
  },
  phoneNumber: commonValidationRules.phone,
  role: {
    in: ['body'],
    optional: true,
    isIn: {
      options: [['customer', 'restaurant', 'driver', 'admin']],
      errorMessage: 'Invalid role',
    },
  },
  address: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
  },
};

// Login validation schema
const loginSchema = {
  email: commonValidationRules.email,
  password: {
    in: ['body'],
    isString: true,
    notEmpty: true,
    errorMessage: 'Password is required',
  },
};

// Update profile validation schema
const updateProfileSchema = {
  firstName: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'First name cannot be empty',
  },
  lastName: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    notEmpty: true,
    errorMessage: 'Last name cannot be empty',
  },
  phoneNumber: {
    ...commonValidationRules.phone,
    optional: true,
  },
  address: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
  },
};

// Change password validation schema
const changePasswordSchema = {
  currentPassword: {
    in: ['body'],
    isString: true,
    notEmpty: true,
    errorMessage: 'Current password is required',
  },
  newPassword: commonValidationRules.password,
};

// Routes
router.post('/register', validate(checkSchema(registerSchema)), register);
router.post('/login', validate(checkSchema(loginSchema)), login);

// Protected routes
router.use(authenticate);
router.get('/profile', getProfile);
router.patch('/profile', validate(checkSchema(updateProfileSchema)), updateProfile);
router.post('/change-password', validate(checkSchema(changePasswordSchema)), changePassword);

export default router; 