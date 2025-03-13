const { DataTypes, Model, ForeignKeyConstraint } = require('sequelize');
const sequelize = require('../sequelize'); // Adjust path to your sequelize.js
const {
  CITIES_TBL,
  CLUSTER_ID_COL,
  ID_COL,
  NAME_COL,
} = require('./models_defines'); // Adjust path to models_defines.js

class City extends Model {
  constructor(id, name, region_id) {
    super();
    this.id = id;
    this.name = name;
    this.region_id = region_id;
  }
}

City.init(
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
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: CLUSTER_ID_COL,
    },
  },
  {
    sequelize,
    tableName: CITIES_TBL,
    modelName: 'City',
    timestamps: false,
    // Add foreign key constraint after initialization.
    // This is because the Region model might not be defined yet when City.init is called.
    hooks: {
      afterSync: async (options) => {
        await sequelize.query(`
          ALTER TABLE ${CITIES_TBL}
          ADD CONSTRAINT fk_city_region
          FOREIGN KEY (${CLUSTER_ID_COL}) REFERENCES regions (${ID_COL});
        `);
      },
    },
  }
);

module.exports = { City };