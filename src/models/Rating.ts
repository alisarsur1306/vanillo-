import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Restaurant from './Restaurant';
import Order from './Order';

export enum RatingType {
  RESTAURANT = 'restaurant',
  DRIVER = 'driver',
  ORDER = 'order'
}

interface RatingAttributes {
  id: string;
  userId: string;
  restaurantId?: string;
  driverId?: string;
  orderId: string;
  type: RatingType;
  rating: number;
  review?: string;
  response?: string;
  isPublic: boolean;
  foodRating?: number;
  serviceRating?: number;
  deliveryRating?: number;
}

interface RatingCreationAttributes extends Omit<RatingAttributes, 'id'> {}

class Rating extends Model<RatingAttributes, RatingCreationAttributes> implements RatingAttributes {
  public id!: string;
  public userId!: string;
  public restaurantId!: string;
  public driverId!: string;
  public orderId!: string;
  public type!: RatingType;
  public rating!: number;
  public review!: string;
  public response!: string;
  public isPublic!: boolean;
  public foodRating!: number;
  public serviceRating!: number;
  public deliveryRating!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rating.init(
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
    restaurantId: {
      type: DataTypes.UUID,
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
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(RatingType)),
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.TEXT,
    },
    response: {
      type: DataTypes.TEXT,
      comment: 'Response from restaurant or driver',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    foodRating: {
      type: DataTypes.FLOAT,
      validate: {
        min: 1,
        max: 5,
      },
    },
    serviceRating: {
      type: DataTypes.FLOAT,
      validate: {
        min: 1,
        max: 5,
      },
    },
    deliveryRating: {
      type: DataTypes.FLOAT,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    tableName: 'ratings',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['restaurantId'],
      },
      {
        fields: ['driverId'],
      },
      {
        fields: ['orderId'],
      },
      {
        fields: ['type'],
      },
    ],
  }
);

// Define associations
Rating.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Rating.belongsTo(User, { as: 'driver', foreignKey: 'driverId' });
Rating.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Rating.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Rating, { as: 'userRatings', foreignKey: 'userId' });
User.hasMany(Rating, { as: 'driverRatings', foreignKey: 'driverId' });
Restaurant.hasMany(Rating, { foreignKey: 'restaurantId' });
Order.hasMany(Rating, { foreignKey: 'orderId' });

export default Rating; 