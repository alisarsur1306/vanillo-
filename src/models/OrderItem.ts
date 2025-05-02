import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Order from './Order';
import MenuItem from './MenuItem';

interface OrderItemAttributes {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  customizations?: string;
}

interface OrderItemCreationAttributes extends Omit<OrderItemAttributes, 'id'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public orderId!: string;
  public menuItemId!: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public specialInstructions!: string;
  public customizations!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    menuItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: MenuItem,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    specialInstructions: {
      type: DataTypes.TEXT,
    },
    customizations: {
      type: DataTypes.JSON,
      comment: 'JSON string containing customization choices',
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['menuItemId'],
      },
    ],
    hooks: {
      beforeValidate: (orderItem: OrderItem) => {
        // Calculate total price
        orderItem.totalPrice = orderItem.quantity * orderItem.unitPrice;
      },
    },
  }
);

// Define associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
MenuItem.hasMany(OrderItem, { foreignKey: 'menuItemId' });

export default OrderItem; 