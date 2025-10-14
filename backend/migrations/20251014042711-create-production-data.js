'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('production_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Production date'
      },
      productionFor: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Production for date (usually tomorrow)'
      },
      pouches: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Number of pouches produced'
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional comments about production'
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
    await queryInterface.addIndex('production_data', ['date']);
    await queryInterface.addIndex('production_data', ['productionFor']);
    await queryInterface.addIndex('production_data', ['user']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('production_data');
  }
};
