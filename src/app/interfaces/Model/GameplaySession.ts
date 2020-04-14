/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';

export class GameplaySession extends DataObject {
  game_id = this.registerIntegerField('game_id', true);
  start_time = this.registerDateField('start_time', true);
  minutes = this.registerIntegerField('minutes', true);
  rating = this.registerDecimalField('rating', false);
  person_id = this.registerIntegerField('person_id', false);

  getApiMethod(): string {
    return 'gameplaySessions';
  }
}
