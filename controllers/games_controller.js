const model = require('./model');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.getGames = async function (request, response) {
  const threeYearsAgo = moment().subtract(3, 'years');

  // noinspection JSCheckFunctionSignatures
  const games = await model.Game.findAll({
    include: {
      model: model.PersonGame,
      required: true,
      where: {
        last_played: {
          [Op.gt]: threeYearsAgo
        },
        person_id: 1
      },
    },
    order:
      [
        [model.PersonGame, 'last_played', 'DESC']
      ],
  });

  response.json(games);
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
