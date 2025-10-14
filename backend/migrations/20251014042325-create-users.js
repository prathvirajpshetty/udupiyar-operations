'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique username for login'
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User password (stored directly)'
      },
      role: {
        type: Sequelize.ENUM('admin', 'employee', 'manager'),
        defaultValue: 'employee',
        allowNull: false,
        comment: 'User role for permissions'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Whether the user account is active'
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last login timestamp'
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
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
