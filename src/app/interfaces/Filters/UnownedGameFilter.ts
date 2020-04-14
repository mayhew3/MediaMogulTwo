import {GameFilter} from './GameFilter';
import {Game} from '../Model/Game';

export class UnownedGameFilter extends GameFilter {
  apply(game: Game): boolean {
    return !game.personGame;
  }
}
