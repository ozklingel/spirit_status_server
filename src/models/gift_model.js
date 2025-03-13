const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize'); // Adjust path to your sequelize.js

class Gift extends Model {}

Gift.init(
  {
    code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      field: 'code',
    },
    was_used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'was_used',
    },
  },
  {
    sequelize,
    tableName: 'gift',
    modelName: 'Gift',
    timestamps: false, // Prevents Sequelize from adding createdAt and updatedAt columns
  }
);

module.exports = { Gift };