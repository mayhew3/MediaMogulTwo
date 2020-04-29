/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';
import {MyGamePlatform} from './MyGamePlatform';

export class AvailableGamePlatform extends DataObject {

  myGamePlatform: MyGamePlatform;

  game_platform_id = this.registerIntegerField('game_platform_id', true);
  platform_name = this.registerStringField('platform_name', true);
  metacritic = this.registerDecimalField('metacritic', true);
  metacritic_page = this.registerBooleanField('metacritic_page', true);
  metacritic_matched = this.registerDateField('metacritic_matched', true);

  constructor(private gamePlatform: GamePlatform,
              public game: Game) {
    super();
  }


  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.gamePlatform.full_name.value);
    }
    return this;
  }

  get platform(): GamePlatform {
    return this.gamePlatform;
  }

  isOwned(): boolean {
    return !!this.myGamePlatform;
  }

  isTemporary(): boolean {
    return !this.id.value || this.platform.isTemporary();
  }

  getApiMethod(): string {
    return 'availablePlatforms';
  }

}
