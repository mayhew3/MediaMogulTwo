import {GameplaySession} from '../interfaces/Model/GameplaySession';

export class GetGameplaySessions {
  static readonly type = '[GameplaySession] Get';
  constructor(public person_id: number) {
  }
}

export class AddGameplaySession {
  static readonly type = '[GameplaySession] Add';
  constructor(public rating: number,
              public game_id: number,
              public minutes: number,
              public start_time: Date,
              public person_id: number) {
  }
}

export class UpdateGameplaySession {
  static readonly type = '[GameplaySession] Update';
  constructor(public rating: number,
              public gameplay_session_id: number) {
  }
}
