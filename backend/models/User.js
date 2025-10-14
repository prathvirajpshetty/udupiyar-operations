module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Unique username for login'
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'User password (stored directly)'
    },
    role: {
      type: DataTypes.ENUM('admin', 'employee', 'manager'),
      defaultValue: 'employee',
      comment: 'User role for permissions'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the user account is active'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last login timestamp'
    }
  }, {
    tableName: 'users',
    timestamps: true, // Adds createdAt and updatedAt
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['role']
      }
    ]
  });

  return User;
};