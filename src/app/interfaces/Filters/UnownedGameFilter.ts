import {GameFilter} from './GameFilter';
import {Game} from '../Model/Game';
import {AvailableGamePlatform} from '../Model/AvailableGamePlatform';
import {PlatformService} from '../../services/platform.service';
import {GameService} from '../../services/game.service';

export class UnownedGameFilter extends GameFilter {
  constructor(private platformService: PlatformService,
              public gameService: GameService) {
    super();
  }

  apply(game: Game): boolean {
    return !this.gameService.isOwned(game) && this.platformService.addablePlatforms(game).length > 0;
  }
}
