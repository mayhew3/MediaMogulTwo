/* tslint:disable:variable-name */
export class PersonGame {
  id: number;
  last_played: Date;
  tier: number;
  rating: number;
  final_score: number;
  replay_score: number;
  minutes_played: number;
  date_added: Date;
  finished_date: Date;
  replay_reason: string;

  constructor(gameObj) {
    this.id = gameObj.id;
    this.tier = gameObj.tier;
    this.rating = gameObj.rating;
    this.final_score = gameObj.final_score;
    this.replay_score = gameObj.replay_score;
    this.minutes_played = gameObj.minutes_played;
    this.date_added = !!gameObj.date_added ? new Date(gameObj.date_added) : null;
    this.finished_date = !!gameObj.finished_date ? new Date(gameObj.finished_date) : null;
    this.replay_reason = gameObj.replay_reason;
    this.last_played = !!gameObj.last_played ? new Date(gameObj.last_played) : null;
  }

  getLastPlayedFormat(): string {
    const thisYear = (new Date()).getFullYear();

    if (!!this.last_played) {
      const year = this.last_played.getFullYear();

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
