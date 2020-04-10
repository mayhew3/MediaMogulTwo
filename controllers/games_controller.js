const model = require('./model');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('underscore');
const ArrayService = require('./array_util');

exports.getGames = async function (request, response) {
  const person_id = request.query.person_id;

  // noinspection JSCheckFunctionSignatures
  const games = await model.Game.findAll();
  const personGames = await model.PersonGame.findAll({
    where: {
      person_id: person_id
    }
  });

  const outputObject = [];

  _.forEach(games, game => {
    const personGame = _.findWhere(personGames, {game_id: game.id});
    const resultObj = game.dataValues;

    if (!!personGame) {
      resultObj.personGame = personGame;
    }

    outputObject.push(resultObj);
  });

  response.json(outputObject);
};

exports.addGame = async function(request, response) {
  const gameObj = request.body;
  const personGameObj = gameObj.personGame;
  delete gameObj.personGame;

  const game = await model.Game.create(gameObj);
  personGameObj.game_id = game.id;

  const returnObj = game.dataValues;

  returnObj.personGame = await model.PersonGame.create(personGameObj);

  response.json(returnObj);
};

exports.addPersonGame = async function(request, response) {
  const payload = {
    game_id: request.body.game_id,
    person_id: request.body.person_id,
    tier: 2,
    minutes_played: 0
  }

  const personGame = await model.PersonGame.create(payload);

  response.json(personGame);
};

exports.updateGame = async function(request, response) {
  const gameID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const game = await model.Game.findByPk(gameID);
    await game.update(changedFields);
    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating game: ' + JSON.stringify(changedFields)});
  }
};

exports.updatePersonGame = async function(request, response) {
  const personGameID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const personGame = await model.PersonGame.findByPk(personGameID);
    await personGame.update(changedFields);
    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating personGame: ' + JSON.stringify(changedFields)});
  }
};

exports.addGameplaySession = async function(request, response) {
  const gameplaySession = request.body;

  await model.GameplaySession.create(gameplaySession);
  response.json({});
};
