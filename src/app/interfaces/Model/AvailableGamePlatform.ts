/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';

export class AvailableGamePlatform extends DataObject {

  game: Game;
  gamePlatform: GamePlatform;

  platformName = this.registerStringField('platform_name', true);
  metacritic = this.registerDecimalField('metacritic', true);
  metacritic_page = this.registerBooleanField('metacritic_page', true);
  metacritic_matched = this.registerDateField('metacritic_matched', true);

  getApiMethod(): string {
    return 'availablePlatforms';
  }

}
