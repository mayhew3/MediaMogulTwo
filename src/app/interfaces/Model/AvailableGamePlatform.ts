/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';

export class AvailableGamePlatform extends DataObject {

  game: Game;
  gamePlatform: GamePlatform;

  getApiMethod(): string {
    return 'availablePlatforms';
  }

}
