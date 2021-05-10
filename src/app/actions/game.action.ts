export class GetGames {
  static readonly type = '[Game] Get';
  constructor(public person_id: number) {
  }
}
