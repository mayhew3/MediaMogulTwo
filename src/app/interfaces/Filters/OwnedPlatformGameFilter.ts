import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from '../Model/Game';
import * as _ from 'underscore';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';

export class OwnedPlatformGameFilter extends GameFilterWithOptions {

  constructor(private platformService: PlatformService) {
    super([]);
    platformService.platforms.subscribe(platforms => this.updateOptions(platforms));
  }

  updateOptions(platforms: GamePlatform[]) {
    const options = _.map(platforms, platform => new GameFilterOption(platform.full_name.value, platform.id.value, true, false));
    ArrayUtil.refreshArray(this.options, options);
    this.addAllAndNone();
  }

  gamePassesOption(game: Game, option: GameFilterOption): boolean {
    return game.ownsPlatformWithID(option.value);
  }

  getLabel(): string {
    return 'Platform';
  }

}
