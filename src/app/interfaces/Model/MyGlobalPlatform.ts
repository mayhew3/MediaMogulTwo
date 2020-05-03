/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {Person} from './Person';
import {GamePlatform} from './GamePlatform';

export class MyGlobalPlatform extends DataObject {

  game_platform_id = this.registerIntegerField('game_platform_id', true);
  platform_name = this.registerStringField("platform_name", true);
  rank = this.registerDecimalField("rank", true);
  person_id = this.registerIntegerField('person_id', true);

  constructor(private gamePlatform: GamePlatform) {
    super();
    this.platform_name.value = gamePlatform.full_name.value;
    this.game_platform_id.value = gamePlatform.id.value;
  }

  get platform(): GamePlatform {
    return this.gamePlatform;
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.gamePlatform.full_name.value);
    }
    return this;
  }

  getApiMethod(): string {
    return 'myGlobalPlatforms';
  }

}
