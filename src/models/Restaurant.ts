import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface RestaurantAttributes {
  id: string;
  userId: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  imageUrl?: string;
  deliveryRadius: number;
  minimumOrder: number;
  averageDeliveryTime: number;
}

interface RestaurantCreationAttributes extends Omit<RestaurantAttributes, 'id'> {}

class Restaurant extends Model<RestaurantAttributes, RestaurantCreationAttributes> implements RestaurantAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public description!: string;
  public cuisine!: string;
  public address!: string;
  public phone!: string;
  public email!: string;
  public openingHours!: string;
  public isVerified!: boolean;
  public isActive!: boolean;
  public rating!: number;
  public imageUrl!: string;
  public deliveryRadius!: number;
  public minimumOrder!: number;
  public averageDeliveryTime!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Restaurant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cuisine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    openingHours: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    imageUrl: {
      type: DataTypes.STRING,
    },
    deliveryRadius: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    minimumOrder: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    averageDeliveryTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'restaurants',
    indexes: [
      {
        unique: true,
        fields: ['userId'],
      },
    ],
  }
);

// Define associations
Restaurant.belongsTo(User, { foreignKey: 'userId' });

export default Restaurant; 