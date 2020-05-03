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
  rating = this.registerDecimalField("rating", true);
  tier = this.registerIntegerField("tier", false);
  final_score = this.registerDecimalField("final_score", false);
  minutes_played = this.registerIntegerField("minutes_played", true);
  replay_score = this.registerDecimalField("replay_score", false);
  last_played = this.registerDateField("last_played", false);
  finished_date = this.registerDateField("finished_date", false);
  collection_add = this.registerDateField("collection_add", false);
  preferred = this.registerBooleanField("preferred", true);
  replay_reason = this.registerStringField("replay_reason", false);
  person_id = this.registerIntegerField('person_id', true);

  constructor(public availableGamePlatform: AvailableGamePlatform) {
    super();
    this.platform_name.value = availableGamePlatform.platform_name.value;
    this.available_game_platform_id.value = availableGamePlatform.id.value;
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

  canAddPlaytime(): boolean {
    return this.availableGamePlatform.canAddToGame();
  }

  isPreferred(): boolean {
    return this.preferred.originalValue === true;
  }

  isTemporary(): boolean {
    return !this.id.value || this.platform.isTemporary();
  }

  getApiMethod(): string {
    return 'myPlatforms';
  }

}
