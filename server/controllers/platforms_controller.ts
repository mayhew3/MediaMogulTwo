import * as model from './model';
const _ = require('underscore');
const Sequelize = require('./sequelize');

exports.getPlatforms = async function (request, response) {
  const person_id = request.query.person_id;

  const platforms = await model.GamePlatform.findAll({
    order: ['id']
  });

  const myGlobals = await model.MyGlobalPlatform.findAll({
    where: {
      person_id: person_id
    }
  });

  const outputObj = [];

  for (const platform of platforms) {
    const myGlobalPlatform = _.findWhere(myGlobals, {game_platform_id: platform.id});

    const returnObj = platform.dataValues;

    if (!!myGlobalPlatform) {
      returnObj.myPlatform = myGlobalPlatform;
    }

    outputObj.push(returnObj);
  }

  response.json(outputObj);
};

exports.addGamePlatform = async function(request, response) {
  const gamePlatformObj = request.body;

  const gamePlatform = await model.GamePlatform.create(gamePlatformObj);
  response.json(gamePlatform);
};

exports.updateGamePlatform = async function(request, response) {
  const gamePlatformID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const gamePlatform = await model.GamePlatform.findByPk(gamePlatformID);
    const oldPlatformName = gamePlatform.full_name;
    await gamePlatform.update(changedFields);

    const newPlatformName = changedFields.full_name;
    if (!!newPlatformName && newPlatformName !== oldPlatformName) {
      const changedAvailableFields = {
        platform_name: newPlatformName
      };

      await model.AvailableGamePlatform.update(changedAvailableFields, {
        where: {
          platform_name: oldPlatformName
        }
      });

      await model.MyGamePlatform.update(changedAvailableFields, {
        where: {
          platform_name: oldPlatformName
        }
      });
    }

    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating gamePlatform: ' + JSON.stringify(changedFields)});
  }
}

exports.updateMultipleGlobals = async function(request, response) {
  try {
    const result = await Sequelize.sequelize.transaction(async (t) => {

      const results = [];

      for (const payload of request.body.payloads) {
        const myGlobalPlatform = await model.MyGlobalPlatform.findByPk(payload.id, {transaction: t});
        await myGlobalPlatform.update(payload.changedFields, {transaction: t});
        results.push(myGlobalPlatform);
      }

      return results;

    });

    response.json(result);
  } catch (err) {
    console.error(err);
    response.json({msg: 'Error: ' + err.message});
  }
};

exports.addMyGlobalPlatform = async function(request, response) {
  const myGlobalObj = request.body;

  const myGlobal = await model.MyGlobalPlatform.create(myGlobalObj);
  response.json(myGlobal);
};

exports.deleteMyGlobalPlatform = async function(request, response) {
  const myGlobalPlatformID = request.params.id;

  const myGlobalPlatform = await model.MyGlobalPlatform.findByPk(myGlobalPlatformID);
  await myGlobalPlatform.destroy();

  response.json({msg: 'Success'});
};
