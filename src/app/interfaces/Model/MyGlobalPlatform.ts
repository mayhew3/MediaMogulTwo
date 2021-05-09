/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {GamePlatform} from './GamePlatform';

export interface MyGlobalPlatform {
  id: number;
  game_platform_id: number;
  platform_name: string;
  rank: number;
  person_id: number;

  platform: GamePlatform;
}
