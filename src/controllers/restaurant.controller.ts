import { Request, Response } from 'express';
import { Restaurant, MenuItem, Rating, User, UserRole } from '../models';
import { AppError } from '../middleware/error';
import { asyncHandler } from '../middleware/error';

// Get all restaurants with filtering and pagination
export const getAllRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    cuisine,
    rating,
    search,
    isOpen = true,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const where: any = { isActive: true };

  if (cuisine) {
    where.cuisine = cuisine;
  }

  if (rating) {
    where.rating = { [Op.gte]: Number(rating) };
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (isOpen === 'true') {
    // Add logic for checking if restaurant is currently open
    // This would involve parsing openingHours and checking against current time
  }

  const restaurants = await Restaurant.findAndCountAll({
    where,
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
    limit: Number(limit),
    offset,
    order: [['rating', 'DESC']],
  });

  res.json({
    status: 'success',
    data: {
      restaurants: restaurants.rows,
      total: restaurants.count,
      pages: Math.ceil(restaurants.count / Number(limit)),
      currentPage: Number(page),
    },
  });
});

// Get single restaurant
export const getRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findByPk(req.params.id, {
    include: [
      {
        model: MenuItem,
        where: { isAvailable: true },
        required: false,
      },
      {
        model: Rating,
        where: { isPublic: true },
        required: false,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      },
    ],
  });

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  res.json({
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// Create restaurant (for restaurant owners)
export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  if (req.user.role !== UserRole.RESTAURANT) {
    throw new AppError('Only restaurant owners can create restaurants', 403);
  }

  const restaurantData = {
    ...req.body,
    userId: req.user.id,
    isVerified: false,
    rating: 0,
  };

  const restaurant = await Restaurant.create(restaurantData);

  res.status(201).json({
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// Update restaurant
export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!restaurant) {
    throw new AppError('Restaurant not found or unauthorized', 404);
  }

  const updatedRestaurant = await restaurant.update(req.body);

  res.json({
    status: 'success',
    data: {
      restaurant: updatedRestaurant,
    },
  });
});

// Delete restaurant
export const deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!restaurant) {
    throw new AppError('Restaurant not found or unauthorized', 404);
  }

  // Soft delete
  await restaurant.update({ isActive: false });

  res.json({
    status: 'success',
    message: 'Restaurant deleted successfully',
  });
});

// Get restaurant menu
export const getRestaurantMenu = asyncHandler(async (req: Request, res: Response) => {
  const menu = await MenuItem.findAll({
    where: {
      restaurantId: req.params.id,
      isAvailable: true,
    },
    order: [['category', 'ASC']],
  });

  res.json({
    status: 'success',
    data: {
      menu,
    },
  });
});

// Add menu item
export const addMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await Restaurant.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!restaurant) {
    throw new AppError('Restaurant not found or unauthorized', 404);
  }

  const menuItem = await MenuItem.create({
    ...req.body,
    restaurantId: restaurant.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      menuItem,
    },
  });
});

// Update menu item
export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await MenuItem.findOne({
    where: {
      id: req.params.itemId,
      restaurantId: req.params.id,
    },
    include: [
      {
        model: Restaurant,
        where: { userId: req.user.id },
      },
    ],
  });

  if (!menuItem) {
    throw new AppError('Menu item not found or unauthorized', 404);
  }

  const updatedMenuItem = await menuItem.update(req.body);

  res.json({
    status: 'success',
    data: {
      menuItem: updatedMenuItem,
    },
  });
});

// Delete menu item
export const deleteMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const menuItem = await MenuItem.findOne({
    where: {
      id: req.params.itemId,
      restaurantId: req.params.id,
    },
    include: [
      {
        model: Restaurant,
        where: { userId: req.user.id },
      },
    ],
  });

  if (!menuItem) {
    throw new AppError('Menu item not found or unauthorized', 404);
  }

  await menuItem.destroy();

  res.json({
    status: 'success',
    message: 'Menu item deleted successfully',
  });
}); 