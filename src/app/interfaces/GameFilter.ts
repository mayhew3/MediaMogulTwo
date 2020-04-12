import {Game} from './Game';

export abstract class GameFilter {
  abstract apply(game: Game): boolean;
}

