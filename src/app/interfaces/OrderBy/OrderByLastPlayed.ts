import {Game} from '../Model/Game';
import {OrderingDirection} from '../../components/gamelist/game-list/OrderingDirection';
import {GameOrdering} from './GameOrdering';

export class OrderByLastPlayed extends GameOrdering {
  constructor(direction: OrderingDirection) {
    super(direction);
    this.displayName = 'Last Played';
  }

  sortValue(game: Game): any {
    return !!game.getLastPlayed() ? game.getLastPlayed() : -1;
  }
}

