const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize'); // Adjust path to your sequelize.js
const { ID_COL, NAME_COL } = require('./models_defines'); // Adjust path to models_defines.js

class Region extends Model {
  constructor(id, name) {
    super();
    this.id = id;
    this.name = name;
  }
}

Region.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: ID_COL,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: NAME_COL,
    },
  },
  {
    sequelize,
    tableName: 'regions',
    modelName: 'Region',
    timestamps: false,
  }
);

module.exports = { Region };