const model = require('./model');
const _ = require('underscore');

exports.getGames = async function (request, response) {
  const games = await model.Game.findAll();
  response.json(games);
};
