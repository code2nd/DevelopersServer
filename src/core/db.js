const Sequelize = require('sequelize');
const { 
  database: {
    dbName, 
    host, 
    port, 
    user, 
    password
  }
} = require('../config/config');

const sequelize = new Sequelize(dbName, user, password, {
  dialect: 'mysql',
  port,
  host,
  logging: true,
  dialectOptions: {
    dateStrings: true,
    typeCast: true
  },
  timezone: '+08:00',
  define: {
    timestamps: true,
    createdAt: "create_time", 
    updatedAt: "update_time",
  }
});

sequelize.sync();

module.exports = {
  sequelize
};