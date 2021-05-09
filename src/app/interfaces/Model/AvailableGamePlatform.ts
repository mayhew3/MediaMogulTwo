/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';
import {MyGamePlatform} from './MyGamePlatform';

export class AvailableGamePlatform extends DataObject {

  myGamePlatform: MyGamePlatform;

  game_platform_id = this.registerIntegerField('game_platform_id', true);
  platform_name = this.registerStringField('platform_name', true);
  metacritic = this.registerDecimalField('metacritic', false);
  metacritic_page = this.registerBooleanField('metacritic_page', false);
  metacritic_matched = this.registerDateField('metacritic_matched', false);
  game_id = this.registerIntegerField('game_id', true);

  constructor(public gamePlatform: GamePlatform,
              public game: Game) {
    super();
    this.game_platform_id.value = gamePlatform.id;
    this.game_id.value = game.id.value;
    this.platform_name.value = gamePlatform.full_name;
  }


  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.gamePlatform.full_name);
    }
    if (!!jsonObj.myPlatform) {
      this.myGamePlatform = new MyGamePlatform(this).initializedFromJSON(jsonObj.myPlatform);
    }
    return this;
  }

  get platform(): GamePlatform {
    return this.gamePlatform;
  }

  isTemporary(): boolean {
    return !this.id.value || !this.platform.id;
  }

  getApiMethod(): string {
    return 'availablePlatforms';
  }

}
