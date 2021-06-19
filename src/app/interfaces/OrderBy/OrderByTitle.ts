import {Game} from '../Model/Game';
import {OrderingDirection} from '../../components/gamelist/game-list/OrderingDirection';
import {GameOrdering} from './GameOrdering';

export class OrderByTitle extends GameOrdering {
  constructor(direction: OrderingDirection) {
    super(direction);
    this.displayName = 'Title';
  }

  sortValue(game: Game): any {
    return game.title;
  }
}

