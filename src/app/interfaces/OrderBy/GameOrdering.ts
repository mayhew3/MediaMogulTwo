import {Game} from '../Model/Game';
import {OrderingDirection} from '../../components/game-list/OrderingDirection';

export abstract class GameOrdering {
  direction: OrderingDirection;
  displayName: string;

  abstract sortValue(game: Game): any;

  protected constructor(direction: OrderingDirection) {
    this.direction = direction;
  }
}

