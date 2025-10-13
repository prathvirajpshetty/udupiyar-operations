module.exports = (sequelize, DataTypes) => {
  const PrintingData = sequelize.define('PrintingData', {
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
      comment: 'Firebase storage URL of uploaded printing image'
    },
    imagePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Firebase storage path of uploaded image'
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
    tableName: 'printing_data',
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

  return PrintingData;
};