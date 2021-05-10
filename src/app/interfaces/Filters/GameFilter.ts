import {Game} from '../Model/Game';

export abstract class GameFilter {
  hasOptions(): boolean {
    return false;
  }
  abstract apply(game: Game): boolean;
}

