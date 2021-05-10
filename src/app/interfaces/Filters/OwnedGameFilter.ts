import {GameFilter} from './GameFilter';
import {Game} from '../Model/Game';
import {GameService} from '../../services/game.service';

export class OwnedGameFilter extends GameFilter {
  constructor(private gameService: GameService) {
    super();
  }

  apply(game: Game): boolean {
    return this.gameService.isOwned(game);
  }
}
