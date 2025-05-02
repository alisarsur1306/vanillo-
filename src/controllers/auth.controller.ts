import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';
import { AppError } from '../middleware/error';
import { asyncHandler } from '../middleware/error';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role = UserRole.CUSTOMER,
    address,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
    address,
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user.id);

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    },
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });

  res.json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phoneNumber, address } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update user
  await user.update({
    firstName: firstName || user.firstName,
    lastName: lastName || user.lastName,
    phoneNumber: phoneNumber || user.phoneNumber,
    address: address || user.address,
  });

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
      },
    },
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await user.validatePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    status: 'success',
    message: 'Password updated successfully',
  });
}); 