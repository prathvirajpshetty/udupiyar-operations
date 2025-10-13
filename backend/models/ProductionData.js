module.exports = (sequelize, DataTypes) => {
  const ProductionData = sequelize.define('ProductionData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Production date'
    },
    productionFor: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Production for date (usually tomorrow)'
    },
    pouches: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Number of pouches produced'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional comments about production'
    },
    user: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Username who entered the data'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the data was submitted'
    }
  }, {
    tableName: 'production_data',
    timestamps: true, // Adds createdAt and updatedAt
    indexes: [
      {
        fields: ['date']
      },
      {
        fields: ['productionFor']
      },
      {
        fields: ['user']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return ProductionData;
};