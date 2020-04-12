import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from './Game';
import * as _ from 'underscore';
import {Platform} from './Platform';

export class PlatformGameFilter extends GameFilterWithOptions {

  private static initializeOptions(): GameFilterOption[] {
    return _.map(Object.keys(Platform), key => {
      return new GameFilterOption(Platform[key], Platform[key], true);
    });
  }

  constructor() {
    super(PlatformGameFilter.initializeOptions());
  }

  apply(game: Game): boolean {
    const gameFilterOptions = this.options;
    const selectedOptionKeys = _.map(_.where(gameFilterOptions, {isActive: true}), option => option.value);
    return _.contains(selectedOptionKeys, game.platform);
  }

}

