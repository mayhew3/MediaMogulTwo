import {Component} from '@angular/core';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderByRating} from '../../interfaces/OrderBy/OrderByRating';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {OrderByLastPlayed} from '../../interfaces/OrderBy/OrderByLastPlayed';
import {OrderByDateAdded} from '../../interfaces/OrderBy/OrderByDateAdded';
import {FinishedGameFilter} from '../../interfaces/Filters/FinishedGameFilter';
import {GameFilterWithOptions} from '../../interfaces/Filters/GameFilterWithOptions';
import {ExistingPlatformGameFilter} from '../../interfaces/Filters/ExistingPlatformGameFilter';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {PlatformService} from '../../services/platform.service';
import {OwnedGameFilter} from '../../interfaces/Filters/OwnedGameFilter';
import {OwnedPlatformGameFilter} from '../../interfaces/Filters/OwnedPlatformGameFilter';
import {OwnedCloudGameFilter} from '../../interfaces/Filters/OwnedCloudGameFilter';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'mm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(private platformService: PlatformService,
              private gameService: GameService) { }

  getBaseFilter(): GameFilter {
    return new OwnedGameFilter(this.gameService);
  }

  getChangeableFilters(): GameFilterWithOptions[] {
    return [
      new OwnedCloudGameFilter(this.platformService),
      new ExistingPlatformGameFilter(this.platformService),
      new OwnedPlatformGameFilter(this.platformService),
      new FinishedGameFilter(),
    ];
  }

  getOrderings(): GameOrdering[] {
    return [
      new OrderByRating(OrderingDirection.desc),
      new OrderByLastPlayed(OrderingDirection.desc),
      new OrderByDateAdded(OrderingDirection.desc, this.gameService),
    ];
  }
}
