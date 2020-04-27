/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {Person} from './Person';
import {GamePlatform} from './GamePlatform';

export class MyGamePlatform extends DataObject {

  person: Person;
  availableGamePlatform: AvailableGamePlatform;

  platform_name = this.registerStringField("platform_name", true);
  rating = this.registerStringField("rating", true);
  tier = this.registerStringField("tier", true);
  final_score = this.registerStringField("final_score", true);
  minutes_played = this.registerStringField("minutes_played", true);
  replay_score = this.registerStringField("replay_score", true);
  last_played = this.registerStringField("last_played", true);
  finished_date = this.registerStringField("finished_date", true);
  replay_reason = this.registerStringField("replay_reason", true);

  get platform(): GamePlatform {
    return this.availableGamePlatform.gamePlatform;
  }

  getApiMethod(): string {
    return 'myPlatforms';
  }

}
