const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const {
  DB_NAME = 'delivery_app',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
} = process.env;

// Debug print to verify environment variables
console.log('DB_NAME:', DB_NAME, 'DB_USER:', DB_USER, 'DB_PASSWORD:', DB_PASSWORD, 'DB_HOST:', DB_HOST, 'DB_PORT:', DB_PORT);

const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // You might want to set this to true in production
    }
  },
  logging: false // Set to console.log to see SQL queries
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 