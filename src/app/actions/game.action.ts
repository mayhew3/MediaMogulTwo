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

export class AddGameToMyCollection {
  static readonly type = '[Game] Add to My Collection'
  constructor(public person_id: number,
              public igdb_id: number,
              public platform_id?: number,
              public igdb_platform_id?: number,
              public rating?: number) {
  }
}
