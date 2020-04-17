import {GameFilter} from './GameFilter';
import {GameFilterOption} from './GameFilterOption';
import * as _ from 'underscore';

export abstract class GameFilterWithOptions extends GameFilter {
  public options: GameFilterOption[];

  abstract getLabel(): string;

  getRegularOptions(): GameFilterOption[] {
    return _.where(this.options, {special: false});
  }

  getSpecialOptions(): GameFilterOption[] {
    return _.where(this.options, {special: true});
  }

  addAllAndNone() {
    this.options.push(new GameFilterOption('All', 'All', true, true));
    this.options.push(new GameFilterOption('None', 'None', false, true));
  }

  protected constructor(options: GameFilterOption[]) {
    super();
    this.options = options;
  }
}

