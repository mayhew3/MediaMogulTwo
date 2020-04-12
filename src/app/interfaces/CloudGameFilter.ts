import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from './Game';
import * as _ from 'underscore';

enum CloudOptions {
  Yes = 'Yes',
  No = 'No',
  Null = 'N/A'
}

export class CloudGameFilter extends GameFilterWithOptions {

  private static initializeOptions(): GameFilterOption[] {
    const myOptions = [];
    myOptions.push(new GameFilterOption(CloudOptions.Yes, true, true));
    myOptions.push(new GameFilterOption(CloudOptions.No, false, true));
    myOptions.push(new GameFilterOption(CloudOptions.Null, null, true));
    return myOptions;
  }

  constructor() {
    super(CloudGameFilter.initializeOptions());
  }

  apply(game: Game): boolean {
    const gameFilterOptions = this.options;
    const selectedOptionKeys = _.map(_.where(gameFilterOptions, {isActive: true}), option => option.value);
    return _.contains(selectedOptionKeys, game.steam_cloud);
  }

}

