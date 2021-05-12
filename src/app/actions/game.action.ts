import {GameData} from '../interfaces/ModelData/GameData';
import {MyGamePlatformData} from '../interfaces/ModelData/MyGamePlatformData';
import {AvailableGamePlatformData} from '../interfaces/Model/AvailableGamePlatform';

export class GetGames {
  static readonly type = '[Game] Get';
  constructor(public person_id: number) {
  }
}

export class GetGameplaySessions {
  static readonly type = '[Game] Get Sessions';
  constructor(public person_id: number,
              public game_id: number) {
  }
}

export class AddGlobalGame {
  static readonly type = '[Game] Add';
  constructor(public game: GameData) {
  }
}

export class AddAvailableGamePlatforms {
  static readonly type = '[Game] Add Available Game Platforms';
  constructor(public availableGamePlatforms: AvailableGamePlatformData[]) {
  }
}

export class AddGameToMyCollection {
  static readonly type = '[Game] Add to My Collection'
  constructor(public myGamePlatform: MyGamePlatformData) {
  }
}
