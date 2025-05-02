import { Router } from 'express';
import authRoutes from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import orderRoutes from './order.routes';
import { notFound, errorHandler } from '../middleware/error';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);

// Error handling
router.use(notFound);
router.use(errorHandler);

export default router; 