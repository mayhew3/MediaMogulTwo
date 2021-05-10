import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from '../Model/Game';
import * as _ from 'underscore';

enum CloudOptions {
  Yes = 'Yes',
  No = 'No',
  Null = 'Unknown'
}

export class MyCloudGameFilter extends GameFilterWithOptions {

  private static initializeOptions(): GameFilterOption[] {
    const myOptions = [];
    myOptions.push(new GameFilterOption(CloudOptions.Yes, true, true, false));
    myOptions.push(new GameFilterOption(CloudOptions.No, false, true, false));
    myOptions.push(new GameFilterOption(CloudOptions.Null, null, true, false));
    return myOptions;
  }

  constructor() {
    super(MyCloudGameFilter.initializeOptions());
  }

  gamePassesOption(game: Game, option: GameFilterOption): boolean {
    if (option.value === true) {
      return game.steam_cloud === true && game.ownsPlatformWithName('Steam');
    } else {
      return game.steam_cloud === false;
    }
  }

  getLabel(): string {
    return 'Cloud';
  }

}

