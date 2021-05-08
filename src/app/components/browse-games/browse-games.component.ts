import {Component} from '@angular/core';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {UnownedGameFilter} from '../../interfaces/Filters/UnownedGameFilter';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderByTitle} from '../../interfaces/OrderBy/OrderByTitle';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {ExistingPlatformGameFilter} from '../../interfaces/Filters/ExistingPlatformGameFilter';
import {GameFilterWithOptions} from '../../interfaces/Filters/GameFilterWithOptions';
import {PlatformService} from '../../services/platform.service';

@Component({
  selector: 'mm-browse-games',
  templateUrl: './browse-games.component.html',
  styleUrls: ['./browse-games.component.scss']
})
export class BrowseGamesComponent {

  constructor(private platformService: PlatformService) { }

  getBaseFilter(): GameFilter {
    return new UnownedGameFilter();
  }

  getChangeableFilters(): GameFilterWithOptions[] {
    return [new ExistingPlatformGameFilter(this.platformService)];
  }

  getOrderings(): GameOrdering[] {
    return [
      new OrderByTitle(OrderingDirection.asc)
    ];
  }
}
