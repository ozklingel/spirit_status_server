const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize'); // Import your Sequelize instance

class Cluster extends Model {
  constructor(id, name) {
    super();
    this.id = id;
    this.name = name;
  }
}

Cluster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: "id",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "name",
    },
  },
  {
    sequelize,
    tableName: 'clusters',
    modelName: 'Cluster',
    timestamps: false,
  }
);

module.exports = { Cluster };