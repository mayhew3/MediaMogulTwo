const model = require('./model');
const _ = require('underscore');
const moment = require('moment');
const arrayService = require('./array_util');
const sequelize = require('sequelize');
const Op = sequelize.Op;

exports.getGames = async function (request, response) {
  const person_id = request.query.person_id;

  // noinspection JSCheckFunctionSignatures
  const games = await model.Game.findAll({
    where: {
      retired: 0
    }
  });
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
  const availablePlatforms = await model.AvailableGamePlatform.findAll();
  const myPlatforms = await model.MyGamePlatform.findAll({
    where: {
      person_id: person_id
    }
  });

  const outputObject = [];

  _.forEach(games, game => {
    const resultObj = game.dataValues;

    const availableForGame = _.where(availablePlatforms, {game_id: game.id});
    resultObj.availablePlatforms = _.map(availableForGame, platform => {
      return {id: platform.game_platform_id};
    });

    const personGame = _.findWhere(personGames, {game_id: game.id});
    if (!!personGame) {
      const returnPersonObj = personGame.dataValues;
      const availableIDs = _.pluck(resultObj.availablePlatforms, 'id');
      const myPlatformsForGame = _.filter(myPlatforms, platform => _.contains(availableIDs, platform.available_game_platform_id));
      returnPersonObj.myPlatforms = _.map(myPlatformsForGame, platform => {
        const availableGamePlatform = _.findWhere(availablePlatforms, {id: platform.available_game_platform_id});
        return {id: availableGamePlatform.game_platform_id};
      });
      resultObj.personGame = returnPersonObj;
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

  if (!!personGameObj) {
    personGameObj.game_id = game.id;
    try {
      const returnPersonGame = await model.PersonGame.create(personGameObj);
      returnObj.personGame = returnPersonGame.dataValues;
    } catch (err) {
      throw new Error(err);
    }

    const myPlatforms = personGameObj.myPlatforms;
    delete personGameObj.myPlatforms;
    const newPlatforms = _.filter(myPlatforms, platform => !platform.id);
    returnObj.personGame.myPlatforms = [];
    const justAdded = _.map(newPlatforms, platform => {
      const found = _.findWhere(addedPlatforms, {full_name: platform.full_name});
      return {id: found.id};
    });
    arrayService.addToArray(returnObj.personGame.myPlatforms, justAdded);
    const oldPlatforms = _.filter(myPlatforms, platform => !!platform.id);
    arrayService.addToArray(returnObj.personGame.myPlatforms, oldPlatforms);
  }

  response.json(returnObj);
};

exports.combineGames = async function(request, response) {
  const gameID = request.body.game_id;
  const otherGameIDs = request.body.other_game_ids;
  const me = request.body.person_id;

  const allPlatforms = await model.GamePlatform.findAll();

  const gameToKeep = await model.Game.findByPk(gameID);
  const otherGames = await model.Game.findAll({
    where: {
      id: {
        [Op.in]: otherGameIDs
      }
    }
  });

  const allGames = arrayService.cloneArray(otherGames);
  allGames.push(gameToKeep);

  const availableGamePlatforms = [];
  for (const game of allGames) {
    const matchingPlatform = _.findWhere(allPlatforms, {full_name: game.platform});
    if (!matchingPlatform) {
      throw new Error(`No platform found with name ${game.platform}`);
    }
    const payload = {
      game_id: gameID,
      game_platform_id: matchingPlatform.id,
      platform_name: matchingPlatform.full_name,
      metacritic: game.metacritic,
      metacritic_page: game.metacritic_page,
      metacritic_matched: game.metacritic_matched
    };
    const availableGamePlatform = await model.AvailableGamePlatform.create(payload);
    availableGamePlatforms.push(availableGamePlatform);
  }

  const allGameIDs = _.pluck(allGames, 'id');
  const allPersonGames = await model.PersonGame.findAll({
    where: {
      game_id: {
        [Op.in]: allGameIDs
      }
    }
  });

  const personIds = _.compact(_.pluck(allPersonGames, 'person_id'));
  const myPlatformIDs = [];
  let myPersonGame;

  for (const person_id of personIds) {
    const personGames = _.where(allPersonGames, {person_id: person_id});
    const personGameToKeep = await getOrCreatePersonGameToKeep(gameToKeep, person_id, personGames);
    if (me === person_id) {
      myPersonGame = personGameToKeep;
    }
    for (const personGame of personGames) {
      const game = _.findWhere(allGames, {id: personGame.game_id});
      const matchingPlatform = _.findWhere(allPlatforms, {full_name: game.platform});
      const availablePlatform = _.findWhere(availableGamePlatforms, {game_platform_id: matchingPlatform.id});
      if (!matchingPlatform || !availablePlatform) {
        throw new Error(`No matching platform found for ${game.platform}`);
      }
      const payload = {
        person_id: person_id,
        available_game_platform_id: availablePlatform.id,
        platform_name: matchingPlatform.full_name,
        rating: personGame.rating,
        tier: personGame.tier,
        last_played: personGame.last_played,
        minutes_played: personGame.minutes_played,
        finished_date: personGame.finished_date,
        final_score: personGame.final_score,
        replay_score: personGame.replay_score,
        replay_reason: personGame.replay_reason,
      }
      await model.MyGamePlatform.create(payload);
      if (me === person_id) {
        myPlatformIDs.push(matchingPlatform.id);
      }
    }
  }

  // todo: return game with everything attached.
  response.json({msg: 'Success'});
};

async function getOrCreatePersonGameToKeep(gameToKeep, person_id, personGames) {
  const existing = _.findWhere(personGames, {game_id: gameToKeep.id});
  if (!!existing) {
    return existing;
  } else {
    const payload = {
      game_id: gameToKeep.id,
      person_id: person_id,
      tier: 2,
      minutes_played: 0,
    }
    return model.PersonGame.create(payload);
  }
}

exports.retireGame = async function(request, response) {
  const game_id = request.params.id;

  const changedFields = {
    retired: game_id,
    retired_date: new Date()
  }

  await model.PersonGame.update(changedFields, {
    where: {
      game_id: game_id
    }
  });

  const game = await model.Game.findByPk(game_id);
  await game.update(changedFields);

  response.json({msg: 'Success'});
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

async function addMyPlatform(available_platform, personID) {
  const payload = {
    available_game_platform_id: available_platform.id,
    person_id: personID
  }
  await model.MyGamePlatform.create(payload);
}

exports.addPersonGame = async function(request, response) {
  const personGameObj = request.body;
  const myPlatforms = personGameObj.myPlatforms;
  delete personGameObj.myPlatforms;

  const personGame = await model.PersonGame.create(personGameObj);

  const returnObj = personGame.dataValues;

  const availablePlatforms = await model.AvailableGamePlatform.findAll({
    where: {
      game_id: personGameObj.game_id
    }
  });

  _.forEach(myPlatforms, async myPlatform => {
    const availableGamePlatform = _.findWhere(availablePlatforms, availablePlatform => availablePlatform.game_platform_id === myPlatform.id);
    const payload = {
      available_game_platform_id: availableGamePlatform.id,
      person_id: personGame.person_id
    }
    await model.MyGamePlatform.create(payload);
  });

  returnObj.myPlatforms = myPlatforms;

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
