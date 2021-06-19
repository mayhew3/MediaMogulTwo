import axios from 'axios';
import _ from 'underscore';
import * as model from './model';
import moment from 'moment';
import {socketServer} from '../www';
import {MyGameAddedMessage} from '../../src/shared/MyGameAddedMessage';
import {GlobalGameAddedMessage} from '../../src/shared/GlobalGameAddedMessage';
import {GamePlatformData} from '../../src/app/interfaces/Model/GamePlatform';
import {AvailableGamePlatformData} from '../../src/app/interfaces/Model/AvailableGamePlatform';
import {MyGamePlatformData} from '../../src/app/interfaces/ModelData/MyGamePlatformData';

const tokens = require('./igdb_token_service');

export const cache: IGDBMatch[] = [];
const MAX_CACHE = 100;

export const getIGDBMatches = async (request: Record<string, any>, response: Record<string, any>): Promise<any> => {
  const game_title = request.query.game_title;

  console.log('Finding IGDB matches for game: ' + game_title);

  const igdbUrl = 'https://api.igdb.com/v4/games';
  const token = await tokens.getToken();
  const clientID = process.env.IGDB_V4_CLIENT_ID;

  if (!clientID) {
    throw new Error('No IGDB_V4_CLIENT_ID!');
  }

  const formatted_name = game_title
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '')
    .replace('™', '')
    .replace('®', '');

  const params = `search "${formatted_name}";
  fields name, platforms.name, cover.image_id, cover.width, cover.height, keywords.name, aggregated_rating,
    aggregated_rating_count, version_parent, first_release_date, genres.name, involved_companies.company.name,
    player_perspectives.name, rating, rating_count, release_dates.date, release_dates.platform.name,
    slug, summary, tags, updated_at, url;
  where release_dates.region = (2,8);
  limit 30;`;

  const options = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': 'en',
      Authorization: 'Bearer ' + token,
      'Client-ID': clientID
    },
    json: true
  };

  axios.post(igdbUrl, params, options).then(matches => {
    const initialCacheSize = cache.length;
    const igdbMatches: IGDBMatch[] = matches.data;
    addAllToCache(igdbMatches);
    const addedToCache = cache.length - initialCacheSize;
    console.debug(`Added ${addedToCache} matches to cache, for a total of ${cache.length}`);
    const oversize = cache.length - MAX_CACHE;
    if (oversize > 0) {
      cache.splice(0, oversize);
      console.debug(`Removed ${oversize} elements from cache, for new total of ${cache.length}`);
    }
    response.json(igdbMatches);
  }).catch(err => {
    console.log(err.response.data[0].cause);
  });


};

export const addGameToCollection = async (request, response): Promise<void> => {
  const person_id = request.body.person_id;
  const igdb_id = request.body.igdb_id;
  let game_platform_id = request.body.platform_id;
  const igdb_platform_id = request.body.igdb_platform_id;
  const rating = request.body.rating;

  const igdbMatch: IGDBMatch = _.findWhere(cache, {id: igdb_id});
  if (!igdbMatch) {
    throw new Error(`No game found in cache with IGDB ID: ${igdb_id}`);
  }

  let game = await model.Game.findOne({
    where: {
      igdb_id: igdbMatch.id
    }
  });
  let newGame;

  if (!game) {
    const {addedGame, posterObj} = await addGame(igdbMatch);
    game = addedGame;
    newGame = addedGame;
    console.log(`Added new game: '${game.title}'`);
  }

  const addedGlobalPlatforms: GamePlatformData[] = [];
  const addedAvailablePlatforms: AvailableGamePlatformData[] = [];
  let myPlatform: MyGamePlatformData;
  const existingAvailablePlatforms: AvailableGamePlatformData[] = await model.AvailableGamePlatform.findAll({
    where: {
      game_id: game.id
    }
  });

  for(const platform of igdbMatch.platforms) {
    const {globalPlatform, added} = await getOrCreateGlobalPlatform(platform);
    if (added) {
      addedGlobalPlatforms.push(globalPlatform);
    }

    let availablePlatform = _.findWhere(existingAvailablePlatforms, {game_platform_id: globalPlatform.id});

    if (!availablePlatform) {
      const availablePlatformObj = {
        game_id: game.id,
        game_platform_id: globalPlatform.id,
        platform_name: globalPlatform.full_name
      }
      availablePlatform = await model.AvailableGamePlatform.create(availablePlatformObj);
      console.log(`Added available platform '${globalPlatform.full_name}' for game '${game.title}'`);
      addedAvailablePlatforms.push(availablePlatform);
    }

    if (platform.id === igdb_platform_id || globalPlatform.id === game_platform_id) {
      const myPlatformObj = {
        person_id,
        available_game_platform_id: availablePlatform.id,
        platform_name: globalPlatform.full_name,
        rating,
        minutes_played: 0,
        collection_add: new Date()
      };
      myPlatform = await model.MyGamePlatform.create(myPlatformObj);
      console.log(`Added MyPlatform '${globalPlatform.full_name}' for game '${game.title}', person ${person_id}`);
    }
  }

  if (!!newGame || addedGlobalPlatforms.length > 0 || addedAvailablePlatforms.length > 0) {
    const messageToEveryone: GlobalGameAddedMessage = {
      game_id: game.id,
      addedGlobalPlatforms,
      newGame,
      addedAvailablePlatforms
    };

    socketServer.emitToAllExceptPerson(person_id, 'global_game_added', messageToEveryone);
  }

  if (!!myPlatform) {
    const messageToPerson: MyGameAddedMessage = {
      game_id: game.id,
      addedGlobalPlatforms,
      newGame,
      addedAvailablePlatforms,
      myPlatform
    }

    socketServer.emitToPerson(person_id, 'my_game_added', messageToPerson);
  }

  response.json({msg: 'Success!'});
}


const addGame = async (igdbMatch: IGDBMatch): Promise<{addedGame, posterObj}> => {
  const coverObj: any = {
    igdb_game_id: igdbMatch.id,
    image_id: igdbMatch.cover.image_id,
    width: igdbMatch.cover.width,
    height: igdbMatch.cover.height,
    default_for_game: true
  };

  const minUnixDate: number = _.chain(igdbMatch.release_dates)
    .map(releaseDate => releaseDate.date)
    .compact()
    .min()
    .value();

  const gameObj = {
    title: igdbMatch.name,
    igdb_id: igdbMatch.id,
    igdb_rating: igdbMatch.rating,
    igdb_rating_count: igdbMatch.rating_count,
    igdb_slug: igdbMatch.slug,
    igdb_summary: igdbMatch.summary,
    igdb_updated: getDateFrom(igdbMatch.updated_at),
    igdb_release_date: getDateFrom(minUnixDate),
    igdb_success: !igdbMatch.id ? null : new Date(),
    igdb_next_update: !igdbMatch.id ? null : moment().add(7, 'days').toDate()
  };

  const addedGame = await model.Game.create(gameObj);

  let posterObj;
  if (!!coverObj.image_id) {
    coverObj.game_id = addedGame.id;
    posterObj = await model.IGDBPoster.create(coverObj);
  }

  return {
    addedGame,
    posterObj
  }
}

async function getOrCreateGlobalPlatform(platform: _.TypeOfCollection<{ id: number; name: string }[]>): Promise<{globalPlatform: GamePlatformData, added: boolean}> {
  const game_platform = await findPlatformWithIGDBID(platform.id);
  if (!game_platform) {
    const gamePlatformObj = {
      full_name: platform.name,
      short_name: platform.name,
      igdb_name: platform.name,
      igdb_platform_id: platform.id
    };
    return {
      globalPlatform: await model.GamePlatform.create(gamePlatformObj),
      added: true
    };
  }
  return {
    globalPlatform: game_platform,
    added: false
  };
}

const getDateFrom = (unixTimestamp: number): Date => {
  return !unixTimestamp ? null : moment.unix(unixTimestamp).toDate();
}

const findPlatformWithIGDBID = async (igdb_platform_id: number): Promise<GamePlatformData> => {
  return await model.GamePlatform.findOne({
    where: {
      igdb_platform_id
    }
  });
}

const addAllToCache = (igdbMatches: IGDBMatch[]): void => {
  _.each(igdbMatches, match => addToCacheIfNotExists(match));
}

const addToCacheIfNotExists = (igdbMatch: IGDBMatch): void => {
  const existing = _.findWhere(cache, {id: igdbMatch.id});
  if (!existing) {
    igdbMatch.match_date = new Date();
    cache.push(igdbMatch);
  } else {
    existing.match_date = new Date();
  }
};
