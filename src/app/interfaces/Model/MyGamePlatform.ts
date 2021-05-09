/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {DataObject} from '../DataObject/DataObject';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {Person} from './Person';
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';

export class MyGamePlatform extends DataObject {

  person: Person;

  available_game_platform_id = this.registerIntegerField('available_game_platform_id', true);
  game_platform_id = this.registerIntegerField('game_platform_id', true);
  platform_name = this.registerStringField('platform_name', true);
  rating = this.registerDecimalField('rating', true);
  tier = this.registerIntegerField('tier', false);
  final_score = this.registerDecimalField('final_score', false);
  minutes_played = this.registerIntegerField('minutes_played', true);
  replay_score = this.registerDecimalField('replay_score', false);
  last_played = this.registerDateField('last_played', false);
  finished_date = this.registerDateField('finished_date', false);
  collection_add = this.registerDateField('collection_add', false);
  preferred = this.registerBooleanField('preferred', true);
  replay_reason = this.registerStringField('replay_reason', false);
  person_id = this.registerIntegerField('person_id', true);

  constructor(public availableGamePlatform: AvailableGamePlatform) {
    super();
    this.platform_name.value = availableGamePlatform.platform_name.value;
    this.available_game_platform_id.value = availableGamePlatform.id.value;
  }

  get platform(): GamePlatform {
    return this.availableGamePlatform.platform;
  }

  get game(): Game {
    return this.availableGamePlatform.game;
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.availableGamePlatform.platform_name.value);
    }
    return this;
  }

  getProgressPercent(): number {
    const minutesPlayed = this.minutes_played.originalValue;
    const minutesToFinish = this.game.minutesToFinish;

    if (!minutesToFinish) {
      return undefined;
    }

    const baseRatio = minutesPlayed / minutesToFinish;
    if (baseRatio > .99) {
      return 99;
    } else {
      return Math.floor(baseRatio * 100);
    }
  }

  isManuallyPreferred(): boolean {
    return this.preferred.originalValue === true;
  }

  isTemporary(): boolean {
    return !this.id.value || !this.platform.id;
  }

  getApiMethod(): string {
    return 'myPlatforms';
  }

}
