import {GamePlatformData} from '../interfaces/Model/GamePlatform';
import {MyGlobalPlatformData} from '../interfaces/Model/MyGlobalPlatform';

export class GetGlobalPlatforms {
  static readonly type = '[GlobalPlatform] Get';
  constructor(public person_id: number) {
  }
}

export class AddGlobalPlatforms {
  static readonly type = '[GlobalPlatform] Add';
  constructor(public platforms: GamePlatformData[]) {
  }
}

export class UpdateGlobalPlatform {
  static readonly type = '[GlobalPlatform] Update';
  constructor(public global_platform_id: number,
              public full_name: string,
              public short_name: string,
              public metacritic_uri: string) {
  }
}

export class AddToMyGlobalPlatforms {
  static readonly type = '[GlobalPlatform] Add to My Global Platforms';
  constructor(public myGlobalPlatform: MyGlobalPlatformData) {
  }
}

export class RemoveFromMyGlobalPlatforms {
  static readonly type = '[GlobalPlatform] Remove from My Global Platforms';
  constructor(public game_platform_id: number) {
  }
}
