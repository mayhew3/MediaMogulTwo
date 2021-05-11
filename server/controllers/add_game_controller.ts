import axios from 'axios';
import _ from 'underscore';
const tokens = require('./igdb_token_service');
import * as model from './model';
import * as moment from 'moment';
import {match} from 'assert';

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

  // Step 1: Add any available platforms to DB that don't exist
  const addedPlatforms = await addGamePlatforms(igdbMatch);

  // Step 2: Add Game to DB
  const {game, posterObj} = await addGame(igdbMatch);
  
  // Step 3: Add Available Platforms to DB
  await addAvailablePlatforms(igdbMatch);

  // Step 4: Add My Game Platforms to DB
  if (!game_platform_id) {
    game_platform_id = await findPlatformWithIGDBID(igdb_platform_id);
  }
  await addMyPlatform(igdbMatch, person_id, game_platform_id, rating);

  // Step 5: Send a message back with all the changes made.


}

const addGamePlatforms = async (igdbMatch: IGDBMatch): Promise<any[]> => {
  const addedPlatforms = [];
  _.each(igdbMatch.platforms, async platform => {
    const game_platform_id = await findPlatformWithIGDBID(platform.id);
    if (!game_platform_id) {
      const gamePlatformObj = {
        full_name: platform.name,
        short_name: platform.name,
        igdb_name: platform.name,
        igdb_platform_id: platform.id
      };
      const gamePlatform = await model.GamePlatform.create(gamePlatformObj);
      addedPlatforms.push(gamePlatform);
    }
  });
  return addedPlatforms;
}

const addGame = async (igdbMatch: IGDBMatch): Promise<any> => {
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

  const game = await model.Game.create(gameObj);

  let posterObj;
  if (!!coverObj.image_id) {
    coverObj.game_id = game.id;
    posterObj = await model.IGDBPoster.create(coverObj);
  }

  return {
    game,
    posterObj
  }
}

const addAvailablePlatforms = async (igdbMatch: IGDBMatch): Promise<any> => {

}

const addMyPlatform = async (igdbMatch: IGDBMatch, person_id: number, game_platform_id: number, rating: number): Promise<any> => {


}

const getDateFrom = (unixTimestamp: number): Date => {
  return !unixTimestamp ? null : moment.unix(unixTimestamp).toDate();
}

const findPlatformWithIGDBID = async (igdb_platform_id: number): Promise<number> => {
  const platform = await model.GamePlatform.findOne({
    where: {
      igdb_platform_id
    }
  });
  return platform.id;
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
