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

  gamePassesOption(game: Game, option: GameFilterOption): boolean {
    return game.isFinished === option.value;
  }

  getLabel(): string {
    return 'Finished';
  }

}

