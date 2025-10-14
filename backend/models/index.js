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
const BatchCodeData = require('./BatchCodeData')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  ProductionData,
  SalesData,
  BatchCodeData,
  User
};

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;