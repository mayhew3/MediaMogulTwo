/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */

export interface GameplaySession {
  id: number;
  game_id: number;
  start_time: Date;
  minutes: number;
  rating: number;
  person_id: number;
}
