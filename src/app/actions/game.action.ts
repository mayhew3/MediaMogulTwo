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
