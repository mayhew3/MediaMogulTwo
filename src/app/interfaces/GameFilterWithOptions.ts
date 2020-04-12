import {GameFilter} from './GameFilter';
import {GameFilterOption} from './GameFilterOption';

export abstract class GameFilterWithOptions extends GameFilter {
  options: GameFilterOption[];

  protected constructor(options: GameFilterOption[]) {
    super();
    this.options = options;
  }
}

