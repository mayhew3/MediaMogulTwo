import {GameFilter} from './GameFilter';
import {Game} from '../Model/Game';
import {AvailableGamePlatform} from '../Model/AvailableGamePlatform';
import {PlatformService} from '../../services/platform.service';

export class UnownedGameFilter extends GameFilter {
  constructor(private platformService: PlatformService) {
    super();
  }

  apply(game: Game): boolean {
    return !game.isOwned() && this.platformService.addablePlatforms(game).length > 0;
  }
}
