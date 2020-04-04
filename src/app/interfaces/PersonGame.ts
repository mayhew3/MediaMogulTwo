/* tslint:disable:variable-name */
export class PersonGame {
  id: number;
  lastPlayed: Date;
  tier: number;
  rating: number;
  finalScore: number;
  replayScore: number;
  minutes_played: number;
  dateAdded: Date;
  finishedDate: Date;
  replayReason: string;

  constructor(gameObj) {
    this.id = gameObj.id;
    this.tier = gameObj.tier;
    this.rating = gameObj.rating;
    this.finalScore = gameObj.final_score;
    this.replayScore = gameObj.replay_score;
    this.minutes_played = gameObj.minutes_played;
    this.dateAdded = new Date(gameObj.date_added);
    this.finishedDate = new Date(gameObj.finished_date);
    this.replayReason = gameObj.replay_reason;
    this.lastPlayed = new Date(gameObj.last_played);
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
