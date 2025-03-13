const { DataTypes, Model, ForeignKeyConstraint } = require('sequelize');
const sequelize = require('../sequelize'); // Adjust path to your sequelize.js
const {
  USERS_TBL,
  ID_COL,
  LAST_NAME_COL,
  EMAIL_COL,
  BIRTHDAY_COL,
  CITY_ID_COL,
  ADDRESS_COL,
  INSTITUTION_ID_COL,
  PHOTO_PATH_COL,
  NOTIFY_START_WEEK_COL,
  NOTIFY_DAY_BEFORE_COL,
  NOTIFY_MORNING_COL,
} = require('./models_defines'); // Adjust path to models_defines.js
const { City } = require('./city_model'); // Adjust path
const { Region } = require('./region_model'); // Adjust path
const { Institution } = require('./institution_model'); // Adjust path
const { Task } = require('./task_model_v2'); // Adjust path
const moment = require('moment');

class User extends Model {
  asDict() {
    const obj = {};
    for (const column of Object.keys(this.dataValues)) {
      obj[column] = this.dataValues[column];
    }
    return obj;
  }

  toAttributes(city, region) {
    return {
      id: String(this.id),
      name: this.name || '',
      last_name: this.last_name || '',
      birthday: this.birthday ? moment(this.birthday).toISOString() : '',
      email: this.email,
      city: city,
      region: region,
      role_ids: this.role_ids ? this.role_ids.split(',').map(Number) : [],
      institution: this.institution_id ? String(this.institution_id) : '',
      cluster_id: this.cluster_id ? Number(this.cluster_id) : '',
      phone: this.id ? String(this.id) : '',
      fcmToken: this.fcmToken ? String(this.fcmToken) : '',
      teudatZehut: this.teudatZehut ? String(this.teudatZehut) : '',
      apprentices: [],
      photo_path: this.photo_path || 'https://www.gravatar.com/avatar',
    };
  }
}

User.init(
  {
    role_ids: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'role_ids',
    },
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
      defaultValue: '',
      field: 'first_name',
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      field: LAST_NAME_COL,
    },
    teudatZehut: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      field: 'teudatzehut',
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      field: EMAIL_COL,
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
      field: BIRTHDAY_COL,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: CITY_ID_COL,
    },
    address: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      field: ADDRESS_COL,
    },
    fcmToken: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '',
      field: 'fcmToken',
    },
    institution_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: INSTITUTION_ID_COL,
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'region_id',
    },
    photo_path: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'https://www.gravatar.com/avatar',
      field: PHOTO_PATH_COL,
    },
    notifyStartWeek: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: NOTIFY_START_WEEK_COL,
    },
    notifyDayBefore: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: NOTIFY_DAY_BEFORE_COL,
    },
    notifyMorning: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: NOTIFY_MORNING_COL,
    },
    notifystartweek_sevev: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'notifystartweek_sevev',
    },
    notifydaybefore_sevev: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'notifydaybefore_sevev',
    },
    notifymorning_sevev: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'notifymorning_sevev',
    },
    notifymorning_weekly_report: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'notifymorning_weekly_report',
    },
    cluster_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'cluster_id',
    },
    association_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'association_date',
    },
    house_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'house_number',
    },
  },
  {
    sequelize,
    tableName: USERS_TBL,
    modelName: 'User',
    timestamps: false,
    // Add foreign key constraints after initialization.
    hooks: {
      afterSync: async (options) => {
        await sequelize.query(`
          ALTER TABLE ${USERS_TBL}
          ADD CONSTRAINT fk_user_city
          FOREIGN KEY (${CITY_ID_COL}) REFERENCES ${City.getTableName()} (${ID_COL}),
          ADD CONSTRAINT fk_user_institution
          FOREIGN KEY (${INSTITUTION_ID_COL}) REFERENCES ${Institution.getTableName()} (${ID_COL}),
          ADD CONSTRAINT fk_user_region
          FOREIGN KEY (region_id) REFERENCES ${Region.getTableName()} (${ID_COL});
        `);
      },
    },
  }
);

User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User };