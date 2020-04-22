/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';

export class PersonGame extends DataObject {
  last_played = this.registerDateField('last_played', false);
  tier = this.registerIntegerField('tier', true);
  rating = this.registerDecimalField('rating', false);
  final_score = this.registerDecimalField('final_score', false);
  replay_score = this.registerDecimalField('replay_score', false);
  minutes_played = this.registerIntegerField('minutes_played', false);
  finished_date = this.registerDateField('finished_date', false);
  replay_reason = this.registerStringField('replay_reason', false);
  person_id = this.registerIntegerField('person_id', true);
  game_id = this.registerIntegerField('game_id', true);

  private _myPlatforms: GamePlatform[];

  constructor() {
    super();
    this.minutes_played.value = 0;
    this.tier.value = 2;
  }

  getLastPlayedFormat(): string {
    const thisYear = (new Date()).getFullYear();

    if (!!this.last_played.value) {
      const year = this.last_played.value.getFullYear();

      if (year === thisYear) {
        return 'EEE M/d';
      } else {
        return 'yyyy.M.d';
      }
    } else {
      return 'yyyy.M.d';
    }
  }

  getApiMethod(): string {
    return 'personGames';
  }
}
