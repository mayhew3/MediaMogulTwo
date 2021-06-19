import {GameFilter} from './GameFilter';
import {GameFilterOption} from './GameFilterOption';
import * as _ from 'underscore';
import {Game} from '../Model/Game';

export abstract class GameFilterWithOptions extends GameFilter {
  public options: GameFilterOption[];

  abstract getLabel(): string;


  hasOptions(): boolean {
    return true;
  }

  getRegularOptions(): GameFilterOption[] {
    return _.where(this.options, {special: false});
  }

  getSpecialOptions(): GameFilterOption[] {
    return _.where(this.options, {special: true});
  }

  addAllAndNone(): void {
    this.options.push(new GameFilterOption('All', 'All', true, true));
    this.options.push(new GameFilterOption('None', 'None', false, true));
  }

  protected constructor(options: GameFilterOption[]) {
    super();
    this.options = options;
  }

  abstract gamePassesOption(game: Game, option: GameFilterOption): boolean;

  apply(game: Game): boolean {
    const gameFilterOptions = this.options;
    const activeRegularOptions = _.where(gameFilterOptions, {isActive: true, special: false});
    const filtered = _.filter(activeRegularOptions, option => this.gamePassesOption(game, option));
    return filtered.length > 0;
  }
}

