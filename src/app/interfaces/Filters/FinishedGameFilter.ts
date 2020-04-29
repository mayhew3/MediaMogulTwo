import {GameFilterOption} from './GameFilterOption';
import {GameFilterWithOptions} from './GameFilterWithOptions';
import {Game} from '../Model/Game';
import * as _ from 'underscore';

enum FinishedOptions {
  Yes = 'Yes',
  No = 'No',
}

export class FinishedGameFilter extends GameFilterWithOptions {

  private static initializeOptions(): GameFilterOption[] {
    const myOptions = [];
    myOptions.push(new GameFilterOption(FinishedOptions.Yes, true, false, false));
    myOptions.push(new GameFilterOption(FinishedOptions.No, false, true, false));
    return myOptions;
  }

  constructor() {
    super(FinishedGameFilter.initializeOptions());
  }

  apply(game: Game): boolean {
    const gameFilterOptions = this.options;
    const selectedOptionKeys = _.map(_.where(gameFilterOptions, {isActive: true}), option => option.value);
    const gameIsFinished = game.isFinished;
    return _.contains(selectedOptionKeys, gameIsFinished);
  }

  getLabel(): string {
    return 'Finished';
  }

}

