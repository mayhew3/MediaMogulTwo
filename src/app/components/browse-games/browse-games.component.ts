import {Component, OnInit} from '@angular/core';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {UnownedGameFilter} from '../../interfaces/Filters/UnownedGameFilter';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderByTitle} from '../../interfaces/OrderBy/OrderByTitle';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {CloudGameFilter} from '../../interfaces/Filters/CloudGameFilter';
import {ExistingPlatformGameFilter} from '../../interfaces/Filters/ExistingPlatformGameFilter';
import {GameFilterWithOptions} from '../../interfaces/Filters/GameFilterWithOptions';
import {PlatformService} from '../../services/platform.service';

@Component({
  selector: 'mm-browse-games',
  templateUrl: './browse-games.component.html',
  styleUrls: ['./browse-games.component.scss']
})
export class BrowseGamesComponent implements OnInit {

  constructor(private platformService: PlatformService) { }

  ngOnInit(): void {
  }

  getBaseFilter(): GameFilter {
    return new UnownedGameFilter();
  }

  getChangeableFilters(): GameFilterWithOptions[] {
    return [new CloudGameFilter(),
      new ExistingPlatformGameFilter(this.platformService)];
  }

  getOrderings(): GameOrdering[] {
    return [
      new OrderByTitle(OrderingDirection.asc)
    ];
  }
}
