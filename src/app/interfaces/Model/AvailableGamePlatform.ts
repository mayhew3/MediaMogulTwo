/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';

export class AvailableGamePlatform extends DataObject {

  game: Game;

  game_platform_id = this.registerIntegerField('game_platform_id', true);
  platform_name = this.registerStringField('platform_name', true);
  metacritic = this.registerDecimalField('metacritic', true);
  metacritic_page = this.registerBooleanField('metacritic_page', true);
  metacritic_matched = this.registerDateField('metacritic_matched', true);

  constructor(private gamePlatform: GamePlatform) {
    super();
    this.platform_name.initializeValue(gamePlatform.full_name.value);
  }

  get platform(): GamePlatform {
    return this.gamePlatform;
  }

  isTemporary(): boolean {
    return !this.id.value || this.platform.isTemporary();
  }

  getApiMethod(): string {
    return 'availablePlatforms';
  }

}
