module.exports = (sequelize, DataTypes) => {
  const BatchCodeData = sequelize.define('BatchCodeData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    selectedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Selected date for printing calculations'
    },
    calculatedDates: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Calculated printing dates and information'
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'S3 URL of uploaded batch code image'
    },
    imageName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'S3 key/filename of uploaded image'
    },
    originalFileName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Original filename of the uploaded image'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes'
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'MIME type of the image'
    },
    ocrText: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'OCR extracted text from uploaded image'
    },
    user: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Username who uploaded the data'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the data was submitted'
    }
  }, {
    tableName: 'batch_code_data',
    timestamps: true, // Adds createdAt and updatedAt
    indexes: [
      {
        fields: ['selectedDate']
      },
      {
        fields: ['user']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return BatchCodeData;
};