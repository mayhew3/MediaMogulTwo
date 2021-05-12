import {GamePlatformData} from '../app/interfaces/Model/GamePlatform';
import {GameData} from '../app/interfaces/ModelData/GameData';
import {AvailableGamePlatformData} from '../app/interfaces/Model/AvailableGamePlatform';

export interface GlobalGameAddedMessage {
  game_id?: number,
  addedGlobalPlatforms: GamePlatformData[];
  newGame?: GameData;
  addedAvailablePlatforms: AvailableGamePlatformData[];
}
