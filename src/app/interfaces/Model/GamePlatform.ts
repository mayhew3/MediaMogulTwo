/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {MyGlobalPlatform} from './MyGlobalPlatform';

export class GamePlatform {
  id: number;
  full_name: string;
  short_name: string;
  igdb_platform_id: number;
  igdb_name: string;
  metacritic_uri: string;

  myGlobalPlatform: MyGlobalPlatform;

}
