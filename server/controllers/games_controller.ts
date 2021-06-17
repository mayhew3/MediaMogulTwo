import * as model from './model';
import {socketServer} from '../www';
import {UpdateMyGamePlatformMessage} from '../../src/shared/UpdateMyGamePlatformMessage';
import {UpdateGameMessage} from '../../src/shared/UpdateGameMessage';
const _ = require('underscore');
const moment = require('moment');

export const getGames = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const person_id = request.query.person_id;

  // noinspection JSCheckFunctionSignatures
  const games = await model.Game.findAll({
    where: {
      retired: 0,
      igdb_ignored: null
    },
    order: ['id']
  });
  const defaultPosters = await model.IGDBPoster.findAll({
    where: {
      default_for_game: true
    }
  });
  const availablePlatforms = await model.AvailableGamePlatform.findAll();
  const myPlatforms = await model.MyGamePlatform.findAll({
    where: {
      person_id
    }
  });

  const outputObject = [];

  _.forEach(games, game => {
    const resultObj = game.dataValues;

    const availableForGame = _.where(availablePlatforms, {game_id: game.id});
    resultObj.availablePlatforms = _.map(availableForGame, availablePlatform => {
      const myPlatformObj = _.findWhere(myPlatforms, {available_game_platform_id: availablePlatform.id});
      let myGamePlatform = null;
      if (!!myPlatformObj) {
        myGamePlatform = myPlatformObj.dataValues;
        myGamePlatform.game_platform_id = availablePlatform.game_platform_id;
      }
      return {
        id: availablePlatform.id,
        game_platform_id: availablePlatform.game_platform_id,
        platform_name: availablePlatform.platform_name,
        metacritic: availablePlatform.metacritic,
        metacritic_page: availablePlatform.metacritic_page,
        metacritic_matched: availablePlatform.metacritic_matched,
        myGamePlatform
      };
    });

    const poster = _.findWhere(defaultPosters, {game_id: game.id});
    if (!!poster) {
      resultObj.igdb_poster = poster.image_id;
      resultObj.igdb_width = poster.width;
      resultObj.igdb_height = poster.height;
    }

    outputObject.push(resultObj);
  });

  response.json(outputObject);
};

export const addGame = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const gameObj = request.body;

  const coverObj: any = {
    igdb_game_id: gameObj.igdb_id,
    image_id: gameObj.igdb_poster,
    width: gameObj.igdb_width,
    height: gameObj.igdb_height,
    default_for_game: true,
  };
  delete gameObj.igdb_width;
  delete gameObj.igdb_height;

  if (!!gameObj.igdb_id) {
    gameObj.igdb_success = new Date();
    gameObj.igdb_next_update = moment().add(7, 'days').toDate();
  }

  const game = await model.Game.create(gameObj);
  const returnObj = game.dataValues;

  if (!!coverObj.image_id) {
    coverObj.game_id = game.id;
    const posterObj = await model.IGDBPoster.create(coverObj);
    returnObj.igdb_poster = posterObj.image_id;
    returnObj.igdb_width = posterObj.width;
    returnObj.igdb_height = posterObj.height;
  }

  response.json(returnObj);
};

export const updateGame = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const gameID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const game = await model.Game.findByPk(gameID);
    await game.update(changedFields);

    const msg: UpdateGameMessage = {
      game
    };

    socketServer.emitToAll('update_game', msg);

    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating game: ' + JSON.stringify(changedFields)});
  }
};

export const updateMyGamePlatform = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const myPlatformID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const myGamePlatform = await model.MyGamePlatform.findByPk(myPlatformID);
    await myGamePlatform.update(changedFields);

    const msg: UpdateMyGamePlatformMessage = {
      my_game_platform: myGamePlatform
    };

    socketServer.emitToPerson(myGamePlatform.person_id, 'update_my_game_platform', msg);

    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating myGamePlatform: ' + JSON.stringify(changedFields)});
  }
};

export const getGameplaySessions = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const person_id = request.query.person_id;
  const game_id = request.query.game_id;

  const mySessions = await model.GameplaySession.findAll({
    where: {
      person_id,
      game_id
    }
  });

  response.json(mySessions);
};

export const addGameplaySession = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const gameplaySession = request.body;

  await model.GameplaySession.create(gameplaySession);
  response.json({});
};

export const addAvailableGamePlatform = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const availableGamePlatformObj = request.body;

  const availableGamePlatform = await model.AvailableGamePlatform.create(availableGamePlatformObj);
  response.json(availableGamePlatform);
};

export const addMyGamePlatform = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const myGamePlatformObj = request.body;

  const myGamePlatform = await model.MyGamePlatform.create(myGamePlatformObj);

  const msg = {
    myPlatform: myGamePlatform
  };

  socketServer.emitToPerson(myGamePlatform.person_id, 'my_game_added', msg);

  response.json({msg: 'Success!'});
};
