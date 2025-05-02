import User, { UserRole } from './User';
import Restaurant from './Restaurant';
import MenuItem from './MenuItem';
import Order, { OrderStatus, PaymentStatus } from './Order';
import OrderItem from './OrderItem';
import Rating, { RatingType } from './Rating';

// Export all models
export {
  User,
  UserRole,
  Restaurant,
  MenuItem,
  Order,
  OrderStatus,
  PaymentStatus,
  OrderItem,
  Rating,
  RatingType,
};

// Note: All model associations are defined in their respective model files 