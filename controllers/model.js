const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

exports.Game = sequelize.sequelize.define("game", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: Sequelize.TEXT,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});
