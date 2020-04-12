import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from './Game';
import * as _ from 'underscore';
import {Platform} from './Platform';
import {ArrayService} from '../services/array.service';

export class PlatformGameFilter extends GameFilterWithOptions {

  private static initializeOptions(): GameFilterOption[] {
    return _.map(Object.keys(Platform), key => {
      return new GameFilterOption(Platform[key], true);
    });
  }

  constructor() {
    super(PlatformGameFilter.initializeOptions());
  }

  static removeFromArray(originalArray, element) {
    const indexOf = originalArray.indexOf(element);
    if (indexOf < 0) {
      console.debug('No element found!');
      return;
    }
    originalArray.splice(indexOf, 1);
  }

  apply(game: Game): boolean {
    const gameFilterOptions = this.options;
    const selectedOptionKeys = _.map(_.where(gameFilterOptions, {isActive: true}), option => option.label);
    return _.contains(selectedOptionKeys, game.platform);
  }

}

