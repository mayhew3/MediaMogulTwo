import axios from 'axios';
import _ from 'underscore';
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

interface IGDBMatch {
  match_date: Date;
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  slug: string;
  summary: string;
  updated_at: number;
  url: string;
  genres: {
    id: number;
    name: string;
  }[];
  involved_companies: {
    id: number;
    company: {
      id: number;
      name: string;
    }
  }[];
  keywords: {
    id: number;
    name: string;
  }[];
  platforms: {
    id: number;
    name: string;
  }[];
  cover: {
    id: number;
    width: number;
    height: number;
    image_id: string;
  };
  player_perspectives: {
    id: number;
    name: string;
  }[];
  release_dates: {
    id: number;
    date: number;
    platform: {
      id: number;
      name: string;
    }
  }[];
  tags: number[];
}
