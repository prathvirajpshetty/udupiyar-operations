'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        username: 'raghu',
        password: '5password3',
        role: 'manager',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        username: 'prakash',
        password: '1password4',
        role: 'employee',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      username: ['admin', 'raghu', 'prakash']
    }, {});
  }
};
