import * as model from './model';
const _ = require('underscore');
const Sequelize = require('./sequelize');
import {socketServer} from '../www';
import {MyGlobalPlatformsRanksChangedMessage} from '../../src/shared/MyGlobalPlatformsRanksChangedMessage';

export const getPlatforms = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const person_id = request.query.person_id;

  const platforms = await model.GamePlatform.findAll({
    order: ['id']
  });

  const myGlobals = await model.MyGlobalPlatform.findAll({
    where: {
      person_id
    }
  });

  const outputObj = [];

  for (const platform of platforms) {
    const myGlobalPlatform = _.findWhere(myGlobals, {game_platform_id: platform.id});

    const returnObj = platform.dataValues;

    if (!!myGlobalPlatform) {
      returnObj.myGlobalPlatform = myGlobalPlatform;
    }

    outputObj.push(returnObj);
  }

  response.json(outputObj);
};

export const addGamePlatform = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const gamePlatformObj = request.body;

  const gamePlatform = await model.GamePlatform.create(gamePlatformObj);
  response.json(gamePlatform);
};

export const updateGamePlatform = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
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

    const msg = {
      global_platform_id: gamePlatformID,
      full_name: changedFields.full_name,
      short_name: changedFields.short_name,
      metacritic_uri: changedFields.metacritic_uri
    };

    socketServer.emitToAll('update_global_platform', msg);

    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating gamePlatform: ' + JSON.stringify(changedFields)});
  }
};

export const updateMultipleGlobals = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  try {
    const person_id = request.body.person_id;
    const msg: MyGlobalPlatformsRanksChangedMessage = {
      changes: []
    };

    const result = await Sequelize.sequelize.transaction(async (t) => {

      const results = [];

      for (const payload of request.body.payloads) {
        const myGlobalPlatform = await model.MyGlobalPlatform.findByPk(payload.id, {transaction: t});
        await myGlobalPlatform.update(payload.changedFields, {transaction: t});
        results.push(myGlobalPlatform);

        msg.changes.push({
          my_global_platform_id: myGlobalPlatform.id,
          rank: myGlobalPlatform.rank
        });
      }

      return results;

    });

    socketServer.emitToPerson(person_id, 'my_global_ranks_changed', msg);

    response.json(result);
  } catch (err) {
    console.error(err);
    response.json({msg: 'Error: ' + err.message});
  }
};

export const addMyGlobalPlatform = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const myGlobalObj = request.body;

  const myGlobal = await model.MyGlobalPlatform.create(myGlobalObj);

  const person_id = myGlobalObj.person_id;
  socketServer.emitToPerson(person_id, 'my_platform_added', {myGlobalPlatform: myGlobal});

  response.json(myGlobal);
};

export const deleteMyGlobalPlatform = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const myGlobalPlatformID = request.params.id;

  const myGlobalPlatform = await model.MyGlobalPlatform.findByPk(myGlobalPlatformID);
  await myGlobalPlatform.destroy();

  const person_id = myGlobalPlatform.person_id;
  const game_platform_id = myGlobalPlatform.game_platform_id;

  socketServer.emitToPerson(person_id, 'my_platform_removed', {game_platform_id});

  response.json({msg: 'Success'});
};
