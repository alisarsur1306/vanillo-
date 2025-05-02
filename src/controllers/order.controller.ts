import { Request, Response } from 'express';
import { Order, OrderItem, Restaurant, MenuItem, User, UserRole, OrderStatus, PaymentStatus } from '../models';
import { AppError } from '../middleware/error';
import { asyncHandler } from '../middleware/error';
import { sequelize } from '../config/database';

// Create a new order
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, items, deliveryAddress, specialInstructions, paymentMethod } = req.body;

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findOne({
      where: {
        id: restaurantId,
        isActive: true,
      },
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found or inactive', 404);
    }

    // Validate items and calculate total
    const menuItems = await MenuItem.findAll({
      where: {
        id: items.map((item: any) => item.menuItemId),
        restaurantId,
        isAvailable: true,
      },
      transaction,
    });

    if (menuItems.length !== items.length) {
      throw new AppError('Some menu items are not available', 400);
    }

    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new AppError('Invalid menu item', 400);
      }
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        specialInstructions: item.specialInstructions,
        customizations: item.customizations,
      };
    });

    // Check minimum order amount
    if (totalAmount < restaurant.minimumOrder) {
      throw new AppError(
        `Minimum order amount is $${restaurant.minimumOrder}. Current total: $${totalAmount}`,
        400
      );
    }

    // Calculate delivery fee and tax
    const deliveryFee = 5; // This could be calculated based on distance
    const tax = totalAmount * 0.1; // 10% tax
    totalAmount += deliveryFee + tax;

    // Create order
    const order = await Order.create(
      {
        customerId: req.user.id,
        restaurantId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        totalAmount,
        deliveryFee,
        tax,
        deliveryAddress,
        specialInstructions,
        paymentMethod,
        estimatedDeliveryTime: new Date(Date.now() + restaurant.averageDeliveryTime * 60000),
      },
      { transaction }
    );

    // Create order items
    await OrderItem.bulkCreate(
      orderItems.map((item: any) => ({
        ...item,
        orderId: order.id,
      })),
      { transaction }
    );

    await transaction.commit();

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [MenuItem],
        },
        {
          model: Restaurant,
          attributes: ['name', 'address', 'phone'],
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      data: {
        order: completeOrder,
      },
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// Get user's orders
export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const where: any = { customerId: req.user.id };
  if (status) {
    where.status = status;
  }

  const orders = await Order.findAndCountAll({
    where,
    include: [
      {
        model: OrderItem,
        include: [MenuItem],
      },
      {
        model: Restaurant,
        attributes: ['name', 'address', 'phone'],
      },
      {
        model: User,
        as: 'driver',
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
  });

  res.json({
    status: 'success',
    data: {
      orders: orders.rows,
      total: orders.count,
      pages: Math.ceil(orders.count / Number(limit)),
      currentPage: Number(page),
    },
  });
});

// Get restaurant's orders
export const getRestaurantOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Verify restaurant ownership
  const restaurant = await Restaurant.findOne({
    where: {
      id: req.params.restaurantId,
      userId: req.user.id,
    },
  });

  if (!restaurant) {
    throw new AppError('Restaurant not found or unauthorized', 404);
  }

  const where: any = { restaurantId: restaurant.id };
  if (status) {
    where.status = status;
  }

  const orders = await Order.findAndCountAll({
    where,
    include: [
      {
        model: OrderItem,
        include: [MenuItem],
      },
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
      },
      {
        model: User,
        as: 'driver',
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
  });

  res.json({
    status: 'success',
    data: {
      orders: orders.rows,
      total: orders.count,
      pages: Math.ceil(orders.count / Number(limit)),
      currentPage: Number(page),
    },
  });
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;

  const order = await Order.findByPk(id, {
    include: [
      {
        model: Restaurant,
        attributes: ['userId'],
      },
    ],
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (
    req.user.role === UserRole.RESTAURANT &&
    order.Restaurant.userId !== req.user.id
  ) {
    throw new AppError('Unauthorized', 403);
  }

  if (
    req.user.role === UserRole.DRIVER &&
    order.driverId !== req.user.id
  ) {
    throw new AppError('Unauthorized', 403);
  }

  // Validate status transition
  const validTransitions: { [key: string]: OrderStatus[] } = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],
    [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  };

  if (!validTransitions[order.status]?.includes(status as OrderStatus)) {
    throw new AppError(`Invalid status transition from ${order.status} to ${status}`, 400);
  }

  // Update order
  await order.update({ status });

  res.json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Assign driver to order
export const assignDriver = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.driverId) {
    throw new AppError('Order already assigned to a driver', 400);
  }

  if (req.user.role !== UserRole.DRIVER) {
    throw new AppError('Only drivers can accept orders', 403);
  }

  await order.update({
    driverId: req.user.id,
    status: OrderStatus.OUT_FOR_DELIVERY,
  });

  res.json({
    status: 'success',
    data: {
      order,
    },
  });
}); 