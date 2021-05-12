import {GamePlatformData} from '../app/interfaces/Model/GamePlatform';
import {GameData} from '../app/interfaces/ModelData/GameData';
import {AvailableGamePlatformData} from '../app/interfaces/Model/AvailableGamePlatform';
import {MyGamePlatformData} from '../app/interfaces/ModelData/MyGamePlatformData';

export interface MyGameAddedMessage {
  game_id: number,
  addedGlobalPlatforms: GamePlatformData[];
  newGame: GameData;
  addedAvailablePlatforms: AvailableGamePlatformData[];
  myPlatform: MyGamePlatformData;
}
