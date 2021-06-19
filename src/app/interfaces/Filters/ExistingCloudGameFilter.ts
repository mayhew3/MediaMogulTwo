import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from '../Model/Game';
import * as _ from 'underscore';

enum CloudOptions {
  Yes = 'Yes',
  No = 'No',
  Null = 'Unknown'
}

export class ExistingCloudGameFilter extends GameFilterWithOptions {

  private static initializeOptions(): GameFilterOption[] {
    const myOptions = [];
    myOptions.push(new GameFilterOption(CloudOptions.Yes, true, true, false));
    myOptions.push(new GameFilterOption(CloudOptions.No, false, true, false));
    myOptions.push(new GameFilterOption(CloudOptions.Null, null, true, false));
    return myOptions;
  }

  constructor() {
    super(ExistingCloudGameFilter.initializeOptions());
  }

  gamePassesOption(game: Game, option: GameFilterOption): boolean {
    if (option.value === true) {
      return game.data.steam_cloud === true && game.hasPlatformWithName('Steam');
    } else if (option.value === false) {
      return game.data.steam_cloud === false;
    } else {
      return !game.data.steam_cloud;
    }
  }

  getLabel(): string {
    return 'Cloud';
  }

}

