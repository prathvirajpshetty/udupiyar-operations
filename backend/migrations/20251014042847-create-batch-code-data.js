'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('batch_code_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      selectedDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Selected date for printing calculations'
      },
      calculatedDates: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Calculated printing dates and information'
      },
      imageUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'S3 URL of uploaded batch code image'
      },
      imageName: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'S3 key/filename of uploaded image'
      },
      originalFileName: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Original filename of the uploaded image'
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'File size in bytes'
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'MIME type of the image'
      },
      ocrText: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'OCR extracted text from uploaded image'
      },
      user: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Username who uploaded the data'
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
    await queryInterface.addIndex('batch_code_data', ['selectedDate']);
    await queryInterface.addIndex('batch_code_data', ['user']);
    await queryInterface.addIndex('batch_code_data', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('batch_code_data');
  }
};
