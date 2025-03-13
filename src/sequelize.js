const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("postgresql://postgres:TH@localhost/t_h", {
  dialect: "postgres",
  logging: false,
});

// Test the connection (optional)
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;