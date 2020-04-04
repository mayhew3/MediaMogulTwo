const model = require('./model');
const _ = require('underscore');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.getGames = async function (request, response) {
  const threeYearsAgo = moment().subtract(3, 'years');

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
      order:
        [
          ['last_played', 'DESC']
        ],
    }
  });

  response.json(games);
};

exports.updatePersonGame = async function(request, response) {
  const personGameID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const personGame = await model.Game.findByPk(personGameID);
    await personGame.update(changedFields);
    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating personGame: ' + JSON.stringify(changedFields)});
  }
};
