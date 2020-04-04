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
  personGame: PersonGame;
  date_added: Date;
  platform: string;
  natural_end: boolean;

  constructor(gameObj) {
    this.id = gameObj.id;
    this.title = gameObj.title;
    this.igdb_poster = gameObj.igdb_poster;
    this.logo = gameObj.logo;
    this.giantbomb_medium_url = gameObj.giantbomb_medium_url;
    this.steamid = gameObj.steamid;
    this.brokenImage = false;
    this.personGame = new PersonGame(gameObj.person_games[0]);
    this.howlong_extras = gameObj.howlong_extras;
    this.timetotal = gameObj.timetotal;
    this.metacritic = gameObj.metacritic;
    this.natural_end = gameObj.natural_end;
    this.platform = gameObj.platform;
    this.date_added = new Date(gameObj.date_added);
  }

}
