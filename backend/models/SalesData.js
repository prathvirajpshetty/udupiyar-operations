module.exports = (sequelize, DataTypes) => {
  const SalesData = sequelize.define('SalesData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Sale date'
    },
    sold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Amount sold'
    },
    exchange: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Exchange amount'
    },
    return: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Return amount'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Total amount'
    },
    regularSale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this is a regular sale'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional comments about the sale'
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
    tableName: 'sales_data',
    timestamps: true, // Adds createdAt and updatedAt
    indexes: [
      {
        fields: ['date']
      },
      {
        fields: ['regularSale']
      },
      {
        fields: ['user']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return SalesData;
};