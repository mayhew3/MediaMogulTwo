export class PersonGame {
  id: number;
  lastPlayed: Date;
  tier: number;
  rating: number;
  finalScore: number;
  replayScore: number;
  minutesPlayed: number;
  dateAdded: Date;
  finishedDate: Date;
  replayReason: string;

  constructor(gameObj) {
    this.id = gameObj.id;
    this.tier = gameObj.tier;
    this.rating = gameObj.rating;
    this.finalScore = gameObj.finalScore;
    this.replayScore = gameObj.replayScore;
    this.minutesPlayed = gameObj.minutesPlayed;
    this.dateAdded = new Date(gameObj.dateAdded);
    this.finishedDate = new Date(gameObj.finishedDate);
    this.replayReason = gameObj.replayReason;
    this.lastPlayed = new Date(gameObj.lastPlayed);
  }

  getLastPlayedFormat(): string {
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
