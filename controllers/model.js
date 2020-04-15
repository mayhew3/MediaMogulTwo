const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

exports.Game = sequelize.sequelize.define("game", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: Sequelize.TEXT,
  date_added: Sequelize.DATE,
  giantbomb_medium_url: Sequelize.TEXT,
  howlong_extras: Sequelize.DECIMAL,
  timetotal: Sequelize.DECIMAL,
  metacritic: Sequelize.INTEGER,
  platform: Sequelize.TEXT,
  steamid: Sequelize.INTEGER,
  logo: Sequelize.TEXT,
  natural_end: Sequelize.BOOLEAN,
  metacritic_hint: Sequelize.TEXT,
  howlong_id: Sequelize.NUMBER,
  giantbomb_id: Sequelize.NUMBER,
  steam_cloud: Sequelize.BOOLEAN,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.Person = sequelize.sequelize.define('person', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  email: Sequelize.TEXT,
  user_role: Sequelize.TEXT,
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.PersonGame = sequelize.sequelize.define("person_game", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  person_id: Sequelize.INTEGER,
  rating: Sequelize.DECIMAL,
  tier: Sequelize.INTEGER,
  final_score: Sequelize.DECIMAL,
  minutes_played: Sequelize.INTEGER,
  replay_score: Sequelize.DECIMAL,
  last_played: Sequelize.DATE,
  date_added: Sequelize.DATE,
  finished_date: Sequelize.DATE,
  replay_reason: Sequelize.TEXT,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.GameplaySession = sequelize.sequelize.define("gameplay_session", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  minutes: Sequelize.INTEGER,
  start_time: Sequelize.DATE,
  rating: Sequelize.DECIMAL,
  person_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.IGDBPoster = sequelize.sequelize.define("igdb_poster", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  image_id: Sequelize.TEXT,
  default_for_game: Sequelize.BOOLEAN,
  width: Sequelize.INTEGER,
  height: Sequelize.INTEGER,
  game_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.Game.hasMany(exports.PersonGame, {foreignKey: 'game_id'});
exports.PersonGame.belongsTo(exports.Game, {foreignKey: 'game_id'});

exports.Game.hasMany(exports.GameplaySession, {foreignKey: 'game_id'});
exports.GameplaySession.belongsTo(exports.Game, {foreignKey: 'game_id'});
