import {Person} from '../Model/Person';

export interface MyGamePlatformData {

  person: Person;

  id: number;
  available_game_platform_id: number;
  game_platform_id: number;
  platform_name: string;
  rating: number;
  tier: number;
  final_score: number;
  minutes_played: number;
  replay_score: number;
  last_played: Date;
  finished_date: Date;
  collection_add: Date;
  preferred: boolean;
  replay_reason: string;
  person_id: number;

}
