const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions || {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const ProductionData = require('./ProductionData')(sequelize, DataTypes);
const SalesData = require('./SalesData')(sequelize, DataTypes);
const PrintingData = require('./PrintingData')(sequelize, DataTypes);

// Define associations here if needed
// ProductionData.hasMany(SalesData);
// SalesData.belongsTo(ProductionData);

const db = {
  sequelize,
  Sequelize,
  ProductionData,
  SalesData,
  PrintingData
};

module.exports = db;