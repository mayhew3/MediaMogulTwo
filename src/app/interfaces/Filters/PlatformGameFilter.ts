import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from '../Model/Game';
import * as _ from 'underscore';
import {Platform} from '../Enum/Platform';

export class PlatformGameFilter extends GameFilterWithOptions {

  private static initializeOptions(): GameFilterOption[] {
    return _.map(Object.keys(Platform), key => {
      return new GameFilterOption(Platform[key], Platform[key], true, false);
    });
  }

  constructor() {
    super(PlatformGameFilter.initializeOptions());
    this.addAllAndNone();
  }

  apply(game: Game): boolean {
    const gameFilterOptions = this.options;
    const selectedOptionKeys = _.map(_.where(gameFilterOptions, {isActive: true, special: false}), option => option.value);
    return _.contains(selectedOptionKeys, game.platform.value);
  }

  getLabel(): string {
    return 'Platform';
  }

}

