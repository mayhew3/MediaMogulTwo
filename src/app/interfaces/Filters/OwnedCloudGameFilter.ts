import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from '../Model/Game';
import * as _ from 'underscore';
import {PlatformService} from '../../services/platform.service';

enum CloudOptions {
  Yes = 'Yes',
  No = 'No',
  Null = 'Unknown'
}

export class OwnedCloudGameFilter extends GameFilterWithOptions {

  constructor(private platformService: PlatformService) {
    super(OwnedCloudGameFilter.initializeOptions());
  }

  private static initializeOptions(): GameFilterOption[] {
    const myOptions = [];
    myOptions.push(new GameFilterOption(CloudOptions.Yes, true, true, false));
    myOptions.push(new GameFilterOption(CloudOptions.No, false, true, false));
    myOptions.push(new GameFilterOption(CloudOptions.Null, null, true, false));
    return myOptions;
  }

  gamePassesOption(game: Game, option: GameFilterOption): boolean {
    if (option.value === true) {
      return game.steam_cloud.value === true && this.platformService.ownsPlatformWithName(game, 'Steam');
    } else if (option.value === false) {
      return game.steam_cloud.value === false;
    } else {
      return !game.steam_cloud.value;
    }
  }

  getLabel(): string {
    return 'Cloud';
  }

}

