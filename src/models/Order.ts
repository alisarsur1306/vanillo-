import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Restaurant from './Restaurant';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

interface OrderAttributes {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  deliveryAddress: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  paymentMethod: string;
  paymentIntentId?: string;
  refundId?: string;
}

interface OrderCreationAttributes extends Omit<OrderAttributes, 'id'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public customerId!: string;
  public restaurantId!: string;
  public driverId!: string;
  public status!: OrderStatus;
  public paymentStatus!: PaymentStatus;
  public totalAmount!: number;
  public deliveryFee!: number;
  public tax!: number;
  public deliveryAddress!: string;
  public specialInstructions!: string;
  public estimatedDeliveryTime!: Date;
  public actualDeliveryTime!: Date;
  public paymentMethod!: string;
  public paymentIntentId!: string;
  public refundId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Restaurant,
        key: 'id',
      },
    },
    driverId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialInstructions: {
      type: DataTypes.TEXT,
    },
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
    },
    actualDeliveryTime: {
      type: DataTypes.DATE,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
    },
    refundId: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    indexes: [
      {
        fields: ['customerId'],
      },
      {
        fields: ['restaurantId'],
      },
      {
        fields: ['driverId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['paymentStatus'],
      },
    ],
  }
);

// Define associations
Order.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Order.belongsTo(User, { as: 'driver', foreignKey: 'driverId' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

User.hasMany(Order, { as: 'customerOrders', foreignKey: 'customerId' });
User.hasMany(Order, { as: 'driverOrders', foreignKey: 'driverId' });
Restaurant.hasMany(Order, { foreignKey: 'restaurantId' });

export default Order; 