import {GameFilter} from './GameFilter';
import {Game} from '../Model/Game';

export class DashboardGameFilter extends GameFilter {
  apply(game: Game): boolean {
    return !!game.personGame && !game.personGame.finished_date.value;
  }
}