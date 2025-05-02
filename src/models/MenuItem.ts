import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Restaurant from './Restaurant';

interface MenuItemAttributes {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spicyLevel: number;
  calories?: number;
  customizationOptions?: string;
}

interface MenuItemCreationAttributes extends Omit<MenuItemAttributes, 'id'> {}

class MenuItem extends Model<MenuItemAttributes, MenuItemCreationAttributes> implements MenuItemAttributes {
  public id!: string;
  public restaurantId!: string;
  public name!: string;
  public description!: string;
  public price!: number;
  public category!: string;
  public imageUrl!: string;
  public isAvailable!: boolean;
  public preparationTime!: number;
  public isVegetarian!: boolean;
  public isVegan!: boolean;
  public isGlutenFree!: boolean;
  public spicyLevel!: number;
  public calories!: number;
  public customizationOptions!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MenuItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Restaurant,
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Preparation time in minutes',
    },
    isVegetarian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isVegan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isGlutenFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    spicyLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    calories: {
      type: DataTypes.INTEGER,
    },
    customizationOptions: {
      type: DataTypes.JSON,
      comment: 'JSON string containing customization options',
    },
  },
  {
    sequelize,
    tableName: 'menu_items',
    indexes: [
      {
        fields: ['restaurantId'],
      },
      {
        fields: ['category'],
      },
    ],
  }
);

// Define associations
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId' });

export default MenuItem; 