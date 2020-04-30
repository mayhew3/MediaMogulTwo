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
      retired: 0,
      igdb_ignored: null
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
    resultObj.availablePlatforms = _.map(availableForGame, availablePlatform => {
      const myPlatformObj = _.findWhere(myPlatforms, {available_game_platform_id: availablePlatform.id});
      let myPlatform = null;
      if (!!myPlatformObj) {
        myPlatform = myPlatformObj.dataValues;
        myPlatform.game_platform_id = availablePlatform.game_platform_id;
      }
      return {
        id: availablePlatform.id,
        game_platform_id: availablePlatform.game_platform_id,
        platform_name: availablePlatform.platform_name,
        metacritic: availablePlatform.metacritic,
        metacritic_page: availablePlatform.metacritic_page,
        metacritic_matched: availablePlatform.metacritic_matched,
        myPlatform: myPlatform
      };
    });

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

  const availablePlatformsObj = gameObj.availablePlatforms;
  delete gameObj.availablePlatforms;

  const allPlatforms = await model.GamePlatform.findAll();

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

  const platformsToAdd = _.filter(availablePlatformsObj, platform => !platform.game_platform_id);
  const platformInserts = [];
  for (const platform of platformsToAdd) {
    platformInserts.push(model.GamePlatform.create(platform));
  }
  const addedPlatforms = await Promise.all(platformInserts);

  arrayService.addToArray(allPlatforms, addedPlatforms);

  for (let availablePlatformObj of availablePlatformsObj) {
    if (!availablePlatformObj.game_platform_id) {
      const gamePlatform = _.findWhere(addedPlatforms, platform => platform.full_name === availablePlatformObj.full_name);
      availablePlatformObj.game_platform_id = gamePlatform.id;
    }
  }

  const availableInserts = [];
  for (const availablePlatformObj of availablePlatformsObj) {
    availableInserts.push(addAvailablePlatform(availablePlatformObj, game, allPlatforms));
  }

  try {
    const availableReturns = await Promise.all(availableInserts);
    returnObj.availablePlatforms = _.map(availableReturns, avr => avr.dataValues);
  } catch (err) {
    handleError(err);
  }

  for (const gamePlatform of addedPlatforms) {
    const availableGamePlatform = _.findWhere(returnObj.availablePlatforms, {game_platform_id: gamePlatform.id});
    availableGamePlatform.gamePlatform = gamePlatform;
  }

  if (!!personGameObj) {
    personGameObj.game_id = game.id;
    try {
      const returnPersonGame = await model.PersonGame.create(personGameObj);
      returnObj.personGame = returnPersonGame.dataValues;
    } catch (err) {
      handleError(err);
    }

    const myPlatformsObj = personGameObj.myPlatforms;
    delete personGameObj.myPlatforms;

    const myPlatformInserts = [];

    for (const myPlatform of myPlatformsObj) {
      const matchingAvailable = getMatchingAvailable(myPlatform, returnObj.availablePlatforms);
      if (!matchingAvailable) {
        throw new Error(`No availablePlatform found. MyPlatform: ${JSON.stringify(myPlatform)}. AvailablePlatforms: ${returnObj.availablePlatforms}`);
      }
      myPlatformInserts.push(addMyPlatform(matchingAvailable, personGameObj.person_id));
    }

    try {
      returnObj.personGame.myPlatforms = await Promise.all(myPlatformInserts);
    } catch (err) {
      handleError(err);
    }
  }

  response.json(returnObj);
};

function getMatchingAvailable(myPlatform, availablePlatforms) {
  if (!myPlatform.game_platform_id) {
    return _.findWhere(availablePlatforms, {platform_name: myPlatform.full_name});
  } else {
    return _.findWhere(availablePlatforms, {game_platform_id: myPlatform.game_platform_id});
  }
}

exports.combineGames = async function(request, response) {
  const gameID = request.body.id;
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

  const allGames = [];
  allGames.push(gameToKeep);
  arrayService.addToArray(allGames, otherGames);

  const availableGamePlatforms = [];
  for (const game of allGames) {
    const matchingPlatform = _.findWhere(allPlatforms, {full_name: game.platform});
    if (!matchingPlatform) {
      throw new Error(`No platform found with name ${game.platform}`);
    }
    const existing = _.findWhere(availableGamePlatforms, {game_platform_id: matchingPlatform.id});
    if (!existing) {
      console.log('Adding available platform ' + matchingPlatform.full_name);
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
    } else {
      console.log('Skipping available platform ' + matchingPlatform.full_name);
    }
  }

  const allGameIDs = _.pluck(allGames, 'id');
  const allPersonGames = await model.PersonGame.findAll({
    where: {
      game_id: {
        [Op.in]: allGameIDs
      }
    }
  });

  const personIds = _.uniq(_.pluck(allPersonGames, 'person_id'));
  const myPlatformIDs = [];
  let myPersonGame;

  for (const person_id of personIds) {
    // make sure we process the game to keep first so those fields are preserved.
    const personGames = _.sortBy(
      _.where(allPersonGames, {person_id: person_id}),
        personGame => personGame.game_id === gameID ? 0 : 1);
    const personGameToKeep = await getOrCreatePersonGameToKeep(gameToKeep, person_id, personGames);
    if (me === person_id) {
      myPersonGame = personGameToKeep;
    }
    const personPlatforms = [];
    for (const personGame of personGames) {
      const game = _.findWhere(allGames, {id: personGame.game_id});
      const matchingPlatform = _.findWhere(allPlatforms, {full_name: game.platform});
      const availablePlatform = _.findWhere(availableGamePlatforms, {game_platform_id: matchingPlatform.id});
      if (!matchingPlatform || !availablePlatform) {
        throw new Error(`No matching platform found for ${game.platform}`);
      }

      const existing = _.findWhere(personPlatforms, {available_game_platform_id: availablePlatform.id});
      if (!existing) {
        console.log(`Adding myPlatform ${matchingPlatform.full_name}, person ID ${person_id}`);
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
        const myPlatform = await model.MyGamePlatform.create(payload);
        personPlatforms.push(myPlatform);
        if (me === person_id) {
          myPlatformIDs.push(matchingPlatform.id);
        }
      } else {
        console.log(`Skipping duplicate myPlatform ${matchingPlatform.full_name}, person ID ${person_id}`);
      }
    }
  }

  const changedFields = {
    game_id: gameID
  }
  const tablesToMove = [model.GameLog, model.GameplaySession, model.SteamAttribute];
  for (const table of tablesToMove) {
    await table.update(changedFields, {
      where: {
        game_id: {
          [Op.in]: otherGameIDs
        }
      }
    });
  }

  const tablesToDelete = [model.IGDBPoster, model.PossibleGameMatch];
  for (const table of tablesToDelete) {
    await table.destroy({
      where: {
        game_id: {
          [Op.in]: otherGameIDs
        }
      }
    })
  }

  for (const game of otherGames) {
    await retireGame(game.id);
  }

  response.json({msg: 'Success'});
};

function handleError(err) {
  console.error(`Error adding AvailablePlatform:`);
  _.forEach(err.errors, myErr => console.error(` * ${myErr.message}`))
  throw err;
}

async function moveGameLogs(changedFields, otherGameIDs) {
  await model.GameLog.update(changedFields, {
    where: {
      game_id: {
        [Op.in]: otherGameIDs
      }
    }
  });
}

async function moveGameplaySessions(changedFields, otherGameIDs) {
  await model.GameplaySession.update(changedFields, {
    where: {
      game_id: {
        [Op.in]: otherGameIDs
      }
    }
  });
}

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

async function retireGame(game_id) {
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
}

async function tryToAddGame(gameObj) {
  try {
    return await model.Game.create(gameObj);
  } catch (err) {
    throw err;
  }
}

async function addAvailablePlatform(availablePlatformObj, game, allPlatforms) {
  const platform = _.findWhere(allPlatforms, {id: availablePlatformObj.game_platform_id});
  if (!platform) {
    throw new Error(`No platform found! AvailablePlatform: ${JSON.stringify(availablePlatformObj)}. All Platforms: ${JSON.stringify(allPlatforms)} `);
  }
  const payload = {
    game_id: game.id,
    game_platform_id: availablePlatformObj.game_platform_id,
    platform_name: platform.full_name
  }
  try {
    return model.AvailableGamePlatform.create(payload);
  } catch (err) {
    handleError(err);
  }
}

async function addMyPlatform(available_platform, person_id) {
  const payload = {
    available_game_platform_id: available_platform.id,
    platform_name: available_platform.platform_name,
    person_id: person_id
  }
  try {
    return model.MyGamePlatform.create(payload);
  } catch (err) {
    handleError(err);
  }
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

exports.updateMyGamePlatform = async function(request, response) {
  const myPlatformID = request.body.id;
  const changedFields = request.body.changedFields;

  try {
    const myGamePlatform = await model.MyGamePlatform.findByPk(myPlatformID);
    await myGamePlatform.update(changedFields);
    response.json({});
  } catch (err) {
    console.error(err);
    response.send({msg: 'Error updating myGamePlatform: ' + JSON.stringify(changedFields)});
  }
}

exports.addGameplaySession = async function(request, response) {
  const gameplaySession = request.body;

  await model.GameplaySession.create(gameplaySession);
  response.json({});
};

exports.addAvailableGamePlatform = async function(request, response) {
  const availableGamePlatformObj = request.body;

  const availableGamePlatform = await model.AvailableGamePlatform.create(availableGamePlatformObj);
  response.json(availableGamePlatform);
};

exports.addMyGamePlatform = async function(request, response) {
  const myGamePlatformObj = request.body;

  const myGamePlatform = await model.MyGamePlatform.create(myGamePlatformObj);
  response.json(myGamePlatform);
};
