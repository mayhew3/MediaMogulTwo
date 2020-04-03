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
    this.igdbPoster = gameObj.igdbPoster;
    this.logo = gameObj.logo;
    this.giantBombMedium = gameObj.giantBombMedium;
    this.steamID = gameObj.steamID;
    this.brokenImage = false;
    this.personGame = new PersonGame(gameObj.personGame);
    this.howLongExtras = gameObj.howLongExtras;
    this.timeTotal = gameObj.timeTotal;
    this.metacritic = gameObj.metacritic;
    this.naturalEnd = gameObj.naturalEnd;
    this.platform = gameObj.platform;
    this.dateAdded = new Date(gameObj.dateAdded);
  }

}
