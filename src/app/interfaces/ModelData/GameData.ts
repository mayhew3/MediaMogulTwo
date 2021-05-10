import {AvailableGamePlatform} from '../Model/AvailableGamePlatform';

export class GameData {
  id: number;
  title: string;
  platform: string;
  natural_end: boolean;
  timetotal: number;

  // metacritic
  metacritic: number;
  metacritic_page: boolean;
  metacritic_matched: Date;
  metacritic_hint: string;

  // steam
  steamid: number;
  steam_cloud: boolean;
  steam_page_gone: Date;
  steam_title: string;
  logo: string;

  // howlong
  howlong_id: number;
  howlong_title: string;
  howlong_extras: number;

  // giant bomb
  giantbomb_medium_url: string;
  giantbomb_id: number;
  giantbomb_name: string;

  // IGDB
  igdb_id: number;
  igdb_poster: string;
  igdb_width: number;
  igdb_height: number;
  igdb_rating: number;
  igdb_rating_count: number;
  igdb_release_date: Date;
  igdb_popularity: number;
  igdb_slug: string;
  igdb_summary: string;
  igdb_updated: Date;

  brokenImage = false;

  availablePlatforms: AvailableGamePlatform[] = [];

}
