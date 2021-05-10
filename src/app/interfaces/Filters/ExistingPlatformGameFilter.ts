import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from '../Model/Game';
import * as _ from 'underscore';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';

export class ExistingPlatformGameFilter extends GameFilterWithOptions {

  constructor(private platformService: PlatformService) {
    super([]);
    platformService.myPlatforms.subscribe(platforms => this.updateOptions(platforms));
  }

  updateOptions(platforms: GamePlatform[]): void {
    const options = _.map(platforms, platform => new GameFilterOption(platform.full_name, platform.id, true, false));
    ArrayUtil.refreshArray(this.options, options);
    this.addAllAndNone();
  }

  apply(game: Game): boolean {
    const gameFilterOptions = this.options;
    const selectedOptionKeys = _.map(_.where(gameFilterOptions, {isActive: true, special: false}), option => option.value);
    const filtered = _.filter(selectedOptionKeys, key => this.platformService.hasPlatformWithID(game, key));
    return filtered.length > 0;
  }

  gamePassesOption(game: Game, option: GameFilterOption): boolean {
    return this.platformService.hasPlatformWithID(game, option.value);
  }

  getLabel(): string {
    return 'Available';
  }

}

