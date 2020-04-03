export class Game {
  id: number;
  title: string;
  igdbPoster: string;
  logo: string;
  giantBombMedium: string;
  steamID: number;
  brokenImage: boolean;
  lastPlayed: Date;

  constructor(gameObj) {
    this.id = gameObj.id;
    this.title = gameObj.title;
    this.igdbPoster = gameObj.igdbPoster;
    this.logo = gameObj.logo;
    this.giantBombMedium = gameObj.giantBombMedium;
    this.steamID = gameObj.steamID;
    this.brokenImage = false;
    this.lastPlayed = new Date(gameObj.lastPlayed);
  }

  getDateFormatString(): string {
    const thisYear = (new Date()).getFullYear();

    if (!!this.lastPlayed) {
      const year = this.lastPlayed.getFullYear();

      if (year === thisYear) {
        return 'EEE M/d';
      } else {
        return 'yyyy.M.d';
      }
    } else {
      return 'yyyy.M.d';
    }
  }
}
