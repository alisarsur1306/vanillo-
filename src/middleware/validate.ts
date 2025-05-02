import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './error';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: { [key: string]: string } = {};
    errors.array().forEach(err => {
      if (err.type === 'field') {
        extractedErrors[err.path] = err.msg;
      }
    });

    throw new AppError(JSON.stringify(extractedErrors), 400);
  };
};

// Common validation rules
export const commonValidationRules = {
  id: {
    in: ['params', 'body'],
    isUUID: true,
    errorMessage: 'Invalid ID format',
  },
  email: {
    in: ['body'],
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Invalid email address',
  },
  password: {
    in: ['body'],
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long',
    },
    matches: {
      options: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
      errorMessage:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  },
  phone: {
    in: ['body'],
    isMobilePhone: {
      options: 'any',
      errorMessage: 'Invalid phone number',
    },
  },
  rating: {
    in: ['body'],
    isFloat: {
      options: { min: 1, max: 5 },
      errorMessage: 'Rating must be between 1 and 5',
    },
  },
  price: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Price must be a positive number',
    },
  },
  quantity: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Quantity must be at least 1',
    },
  },
}; 