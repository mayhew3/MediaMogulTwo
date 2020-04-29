/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {Person} from './Person';
import {GamePlatform} from './GamePlatform';

export class MyGamePlatform extends DataObject {

  person: Person;

  available_game_platform_id = this.registerIntegerField('available_game_platform_id', true);
  game_platform_id = this.registerIntegerField('game_platform_id', true);
  platform_name = this.registerStringField("platform_name", true);
  rating = this.registerStringField("rating", true);
  tier = this.registerStringField("tier", true);
  final_score = this.registerStringField("final_score", true);
  minutes_played = this.registerStringField("minutes_played", true);
  replay_score = this.registerStringField("replay_score", true);
  last_played = this.registerStringField("last_played", true);
  finished_date = this.registerStringField("finished_date", true);
  replay_reason = this.registerStringField("replay_reason", true);

  constructor(private availableGamePlatform: AvailableGamePlatform) {
    super();
    this.platform_name.initializeValue(availableGamePlatform.platform_name.value);
    availableGamePlatform.myGamePlatform = this;
  }

  get platform(): GamePlatform {
    return this.availableGamePlatform.platform;
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.availableGamePlatform.platform_name.value);
    }
    return this;
  }

  isTemporary(): boolean {
    return !this.id.value || this.platform.isTemporary();
  }

  getApiMethod(): string {
    return 'myPlatforms';
  }

}
