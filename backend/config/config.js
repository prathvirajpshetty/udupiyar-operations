require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dev_udupiyar_operations', // Use dev database for localhost
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log, // Enable SQL logging in development
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds') ? {
        require: false,
        rejectUnauthorized: false
      } : false
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.PROD_DB_NAME || 'prod_udupiyar_operations', // Use prod database for Lambda
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds') ? {
        require: false,
        rejectUnauthorized: false
      } : false
    }
  }
};