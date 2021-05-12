import axios from 'axios';
import _ from 'underscore';
import * as model from './model';
import * as moment from 'moment';

const tokens = require('./igdb_token_service');

export const cache: IGDBMatch[] = [];

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
    const igdbMatches: IGDBMatch[] = matches.data;
    addAllToCache(igdbMatches);
    response.json(igdbMatches);
  }).catch(err => {
    console.log(err.response.data[0].cause);
  });


};

export const addGameToCollection = async (request, response): Promise<void> => {
  const person_id = request.query.person_id;
  const igdb_id = request.query.igdb_id;
  let game_platform_id = request.query.platform_id;
  const igdb_platform_id = request.query.igdb_platform_id;
  const rating = request.query.rating;

  const igdbMatch: IGDBMatch = _.findWhere(cache, {id: igdb_id});
  if (!igdbMatch) {
    throw new Error(`No game found in cache with IGDB ID: ${igdb_id}`);
  }

  let game = model.Game.findOne({
    where: {
      igdb_id: igdbMatch.id
    }
  });

  if (!game) {
    const {addedGame, posterObj} = await addGame(igdbMatch);
    game = addedGame;
  }

  // Step 3: Add Available Platforms to DB
  const addedGlobalPlatforms = [];
  const addedAvailablePlatforms = [];
  let myPlatform;
  const existingAvailablePlatforms = model.AvailableGamePlatform.findAll({
    where: {
      game_id: game.id
    }
  });
  _.each(igdbMatch.platforms, async platform => {
    const {globalPlatform, added} = await getOrCreateGlobalPlatform(platform);
    if (added) {
      addedGlobalPlatforms.push(globalPlatform);
    }

    let availablePlatform = _.findWhere(existingAvailablePlatforms, p => p.igdb_platform_id === platform.id);

    if (!availablePlatform) {
      const availablePlatformObj = {
        game_id: game.id,
        game_platform_id: globalPlatform.id,
        platform_name: globalPlatform.full_name
      }
      availablePlatform = await model.AvailableGamePlatform.create(availablePlatformObj);
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
    }
  });

  const messageToEveryone = {

  };
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

async function getOrCreateGlobalPlatform(platform: _.TypeOfCollection<{ id: number; name: string }[]>): Promise<{globalPlatform, added: boolean}> {
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

const findPlatformWithIGDBID = async (igdb_platform_id: number): Promise<any> => {
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
