/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */

import {GamePlatform} from './GamePlatform';

export class MyGlobalPlatform {
  constructor(public data: MyGlobalPlatformData,
              public platform: GamePlatform) {
  }

  get id(): number {
    return this.data.id;
  }

  get rank(): number {
    return this.data.rank;
  }
}

export interface MyGlobalPlatformData {
  id: number;
  game_platform_id: number;
  platform_name: string;
  rank: number;
  person_id: number;
}
