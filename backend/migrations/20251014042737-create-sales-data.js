'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Sale date'
      },
      sold: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Amount sold'
      },
      exchange: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Exchange amount'
      },
      return: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Return amount'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total amount'
      },
      regularSale: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this is a regular sale'
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional comments about the sale'
      },
      user: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Username who entered the data'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'When the data was submitted'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('sales_data', ['date']);
    await queryInterface.addIndex('sales_data', ['regularSale']);
    await queryInterface.addIndex('sales_data', ['user']);
    await queryInterface.addIndex('sales_data', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sales_data');
  }
};
