import {Game} from '../Model/Game';
import {OrderingDirection} from '../../components/game-list/OrderingDirection';
import {GameOrdering} from './GameOrdering';

export class OrderByRating extends GameOrdering {
  constructor(direction: OrderingDirection) {
    super(direction);
    this.displayName = 'Rating';
  }

  sortValue(game: Game): any {
    return game.bestMyRatingOrMetacritic;
  }
}

