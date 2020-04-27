import {GameFilter} from './GameFilter';
import {Game} from '../Model/Game';

export class MultiplePlatformsGameFilter extends GameFilter {
  apply(game: Game): boolean {
    return !!game.personGame && game.platforms.length > 1;
  }
}