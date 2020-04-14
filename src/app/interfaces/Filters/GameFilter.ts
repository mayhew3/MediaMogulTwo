import {Game} from '../Model/Game';

export abstract class GameFilter {
  abstract apply(game: Game): boolean;
}

