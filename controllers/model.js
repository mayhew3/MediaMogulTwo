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
  metacritic_page: Sequelize.BOOLEAN,
  metacritic_matched: Sequelize.DATE,
  platform: Sequelize.TEXT,
  steamid: Sequelize.INTEGER,
  steam_page_gone: Sequelize.DATE,
  steam_title: Sequelize.TEXT,
  logo: Sequelize.TEXT,
  natural_end: Sequelize.BOOLEAN,
  metacritic_hint: Sequelize.TEXT,
  howlong_id: Sequelize.NUMBER,
  howlong_title: Sequelize.TEXT,
  giantbomb_id: Sequelize.NUMBER,
  giantbomb_name: Sequelize.TEXT,
  steam_cloud: Sequelize.BOOLEAN,
  igdb_id: Sequelize.INTEGER,
  igdb_rating: Sequelize.DECIMAL,
  igdb_rating_count: Sequelize.INTEGER,
  igdb_release_date: Sequelize.DATE,
  igdb_popularity: Sequelize.DECIMAL,
  igdb_slug: Sequelize.TEXT,
  igdb_summary: Sequelize.TEXT,
  igdb_updated: Sequelize.DATE,
  igdb_success: Sequelize.DATE,
  igdb_ignored: Sequelize.DATE,
  igdb_next_update: Sequelize.DATE,
  retired: Sequelize.INTEGER,
  retired_date: Sequelize.DATE,
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

exports.GameplaySession = sequelize.sequelize.define("gameplay_session", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  minutes: Sequelize.INTEGER,
  start_time: Sequelize.DATE,
  rating: Sequelize.DECIMAL,
  person_id: Sequelize.INTEGER,
  game_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.GameLog = sequelize.sequelize.define("game_log", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.SteamAttribute = sequelize.sequelize.define("steam_attribute", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.PossibleGameMatch = sequelize.sequelize.define("possible_game_match", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
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
  igdb_game_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.GamePlatform = sequelize.sequelize.define("game_platform", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: Sequelize.TEXT,
  short_name: Sequelize.TEXT,
  igdb_name: Sequelize.TEXT,
  igdb_platform_id: Sequelize.INTEGER,
  metacritic_uri: Sequelize.TEXT,
  parent_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.AvailableGamePlatform = sequelize.sequelize.define("available_game_platform", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  game_id: Sequelize.INTEGER,
  game_platform_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
  platform_name: Sequelize.TEXT,
  metacritic: Sequelize.INTEGER,
  metacritic_page: Sequelize.BOOLEAN,
  metacritic_matched: Sequelize.DATE,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.MyGamePlatform = sequelize.sequelize.define("my_game_platform", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  person_id: Sequelize.INTEGER,
  available_game_platform_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
  platform_name: Sequelize.TEXT,
  rating: Sequelize.DECIMAL,
  tier: Sequelize.INTEGER,
  final_score: Sequelize.DECIMAL,
  minutes_played: Sequelize.INTEGER,
  replay_score: Sequelize.DECIMAL,
  last_played: Sequelize.DATE,
  finished_date: Sequelize.DATE,
  collection_add: Sequelize.DATE,
  preferred: Sequelize.BOOLEAN,
  replay_reason: Sequelize.TEXT,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.MyGlobalPlatform = sequelize.sequelize.define("person_platform", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  person_id: Sequelize.INTEGER,
  game_platform_id: Sequelize.INTEGER,
  date_added: Sequelize.DATE,
  platform_name: Sequelize.TEXT,
  rank: Sequelize.INTEGER,
}, {
  freezeTableName: true,
  createdAt: false,
  updatedAt: false
});

exports.Game.hasMany(exports.GameplaySession, {foreignKey: 'game_id'});
exports.GameplaySession.belongsTo(exports.Game, {foreignKey: 'game_id'});
