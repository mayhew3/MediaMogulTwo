import {PersonGame} from './PersonGame';

export class Game {
  id: number;
  title: string;
  igdbPoster: string;
  logo: string;
  giantBombMedium: string;
  steamID: number;
  brokenImage: boolean;
  howLongExtras: number;
  timeTotal: number;
  metacritic: number;
  personGame: PersonGame;
  dateAdded: Date;
  platform: string;
  naturalEnd: boolean;

  constructor(gameObj) {
    this.id = gameObj.id;
    this.title = gameObj.title;
    this.igdbPoster = gameObj.igdb_poster;
    this.logo = gameObj.logo;
    this.giantBombMedium = gameObj.giantbomb_medium_url;
    this.steamID = gameObj.steamid;
    this.brokenImage = false;
    this.personGame = new PersonGame(gameObj.person_games[0]);
    this.howLongExtras = gameObj.howlong_extras;
    this.timeTotal = gameObj.timetotal;
    this.metacritic = gameObj.metacritic;
    this.naturalEnd = gameObj.natural_end;
    this.platform = gameObj.platform;
    this.dateAdded = new Date(gameObj.date_added);
  }

}
