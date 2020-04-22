const model = require('./model');
const _ = require('underscore');
const moment = require('moment');
const arrayService = require('./array_util');

exports.getGames = async function (request, response) {
  const person_id = request.query.person_id;

  // noinspection JSCheckFunctionSignatures
  const games = await model.Game.findAll();
  const personGames = await model.PersonGame.findAll({
    where: {
      person_id: person_id
    }
  });
  const defaultPosters = await model.IGDBPoster.findAll({
    where: {
      default_for_game: true
    }
  });

  const outputObject = [];

  _.forEach(games, game => {
    const resultObj = game.dataValues;

    const personGame = _.findWhere(personGames, {game_id: game.id});
    if (!!personGame) {
      resultObj.personGame = personGame;
    }

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

exports.addGame = async function(request, response) {
  const gameObj = request.body;
  const personGameObj = gameObj.personGame;
  delete gameObj.personGame;

  const availablePlatforms = gameObj.availablePlatforms;
  delete gameObj.availablePlatforms;

  const coverObj = {
    igdb_game_id: gameObj.igdb_id,
    image_id: gameObj.igdb_poster,
    width: gameObj.igdb_width,
    height: gameObj.igdb_height,
    default_for_game: true,
  }
  delete gameObj.igdb_width;
  delete gameObj.igdb_height;

  if (!!gameObj.igdb_id) {
    gameObj.igdb_success = new Date();
    gameObj.igdb_next_update = moment().add(7, 'days').toDate();
  }

  const game = await tryToAddGame(gameObj);
  const returnObj = game.dataValues;

  if (!!personGameObj) {
    personGameObj.game_id = game.id;
    returnObj.personGame = await model.PersonGame.create(personGameObj);
  }
  if (!!coverObj.image_id) {
    coverObj.game_id = game.id;
    const posterObj = await model.IGDBPoster.create(coverObj);
    returnObj.igdb_poster = posterObj.image_id;
    returnObj.igdb_width = posterObj.width;
    returnObj.igdb_height = posterObj.height;
  }

  const platformsToAdd = _.filter(availablePlatforms, platform => !platform.id);
  const platformInserts = [];
  _.forEach(platformsToAdd, platform => platformInserts.push(model.GamePlatform.create(platform)));
  const addedPlatforms = await Promise.all(platformInserts);

  const availableInserts = [];
  _.forEach(addedPlatforms, platform => availableInserts.push(addAvailablePlatform(platform, game)));
  await Promise.all(availableInserts);

  const existingPlatforms = _.filter(availablePlatforms, platform => !!platform.id);

  returnObj.availablePlatforms = [];
  arrayService.addToArray(returnObj.availablePlatforms, addedPlatforms);
  arrayService.addToArray(returnObj.availablePlatforms, existingPlatforms);

  response.json(returnObj);
};

async function tryToAddGame(gameObj) {
  try {
    return await model.Game.create(gameObj);
  } catch (err) {
    throw err;
  }
}

async function addAvailablePlatform(platform, game) {
  const payload = {
    game_id: game.id,
    game_platform_id: platform.id
  }
  await model.AvailableGamePlatform.create(payload);
}

exports.addPersonGame = async function(request, response) {
  const personGameObj = request.body;
  const personGame = await model.PersonGame.create(personGameObj);
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
