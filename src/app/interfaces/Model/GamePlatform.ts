/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {MyGlobalPlatform, MyGlobalPlatformData} from './MyGlobalPlatform';

export class GamePlatform {
  myGlobalPlatform?: MyGlobalPlatform;

  constructor(public data: GamePlatformData) {
    if (!!data.myGlobalPlatform) {
      this.myGlobalPlatform = new MyGlobalPlatform(data.myGlobalPlatform, this);
    }
  }

  get id(): number {
    return this.data.id;
  }

  get platform_name(): string {
    return this.data.full_name;
  }

  get igdb_platform_id(): number {
    return this.data.igdb_platform_id;
  }
}

export interface GamePlatformData {
  id: number;
  full_name: string;
  short_name: string;
  igdb_platform_id: number;
  igdb_name: string;
  metacritic_uri?: string;

  myGlobalPlatform?: MyGlobalPlatformData;

}
