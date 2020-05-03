import {GameFilter} from './GameFilter';
import {Game} from '../Model/Game';

export class OwnedGameFilter extends GameFilter {
  apply(game: Game): boolean {
    return game.isOwned() && game.hasPlatformInMyGlobals();
  }
}
