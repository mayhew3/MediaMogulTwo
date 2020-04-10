/* tslint:disable:variable-name */
import {PersonGame} from './PersonGame';

export class Game {
  id: number;
  title: string;
  igdb_poster: string;
  logo: string;
  giantbomb_medium_url: string;
  steamid: number;
  brokenImage: boolean;
  howlong_extras: number;
  timetotal: number;
  metacritic: number;
  metacritic_hint: string;
  personGame: PersonGame;
  date_added: Date;
  platform: string;
  natural_end: boolean;
  howlong_id: number;
  giantbomb_id: number;

  constructor(gameObj) {
    this.id = gameObj.id;
    this.title = gameObj.title;
    this.igdb_poster = gameObj.igdb_poster;
    this.logo = gameObj.logo;
    this.giantbomb_medium_url = gameObj.giantbomb_medium_url;
    this.steamid = gameObj.steamid;
    this.brokenImage = false;
    this.personGame = !!gameObj.personGame ? new PersonGame(gameObj.personGame) : undefined;
    this.howlong_extras = gameObj.howlong_extras;
    this.timetotal = gameObj.timetotal;
    this.metacritic = gameObj.metacritic;
    this.metacritic_hint = gameObj.metacritic_hint;
    this.natural_end = gameObj.natural_end;
    this.platform = gameObj.platform;
    this.date_added = !!gameObj.date_added ? new Date(gameObj.date_added) : null;
    this.howlong_id = gameObj.howlong_id;
    this.giantbomb_id = gameObj.giantbomb_id;
  }

  isOwned(): boolean {
    return !!this.personGame;
  }
}
