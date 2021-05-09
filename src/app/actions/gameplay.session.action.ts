import {GameplaySession} from '../interfaces/Model/GameplaySession';

export class GetGameplaySessions {
  static readonly type = '[GameplaySession] Get';
  constructor(public person_id: number) {
  }
}

export class UpdateGameplaySession {
  static readonly type = '[GameplaySession] Update';
  constructor(public rating: number,
              public gameplay_session_id: number) {
  }
}
