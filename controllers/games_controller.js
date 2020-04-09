const model = require('./model');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('underscore');

exports.getGames = async function (request, response) {
  const threeYearsAgo = moment().subtract(3, 'years');

  // noinspection JSCheckFunctionSignatures
  const games = await model.Game.findAll({
    include: {
      model: model.PersonGame,
      required: true,
      where: {
        person_id: 1
      },
    },
    order:
      [
        [model.PersonGame, 'last_played', 'DESC']
      ],
  });

  const outputObject = [];

  _.forEach(games, game => {
    const personGame = game.person_games[0];
    const resultObj = game.dataValues;

    resultObj.personGame = personGame;

    delete resultObj.person_games;

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
