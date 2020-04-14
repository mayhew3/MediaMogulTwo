import {Game} from '../Model/Game';
import {OrderingDirection} from '../../components/game-list/OrderingDirection';
import {GameOrdering} from './GameOrdering';

export class OrderByDateAdded extends GameOrdering {
  constructor(direction: OrderingDirection) {
    super(direction);
    this.displayName = 'Date Added';
  }

  sortValue(game: Game): any {
    return !game.personGame ?
      (!game.date_added.value ? null : game.date_added.value) :
      game.personGame.date_added.value;
  }
}

