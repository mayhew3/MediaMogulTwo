/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';

export class MyGlobalPlatform extends DataObject {

  game_platform_id = this.registerIntegerField('game_platform_id', true);
  platform_name = this.registerStringField('platform_name', true);
  rank = this.registerIntegerField('rank', true);
  person_id = this.registerIntegerField('person_id', true);

  constructor(private gamePlatform: GamePlatform) {
    super();
    this.platform_name.value = gamePlatform.full_name;
    this.game_platform_id.value = gamePlatform.id;
  }

  get platform(): GamePlatform {
    return this.gamePlatform;
  }

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.gamePlatform.full_name);
    }
    return this;
  }

  getApiMethod(): string {
    return 'myGlobalPlatforms';
  }

}
