import {Component, OnInit} from '@angular/core';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {UnownedGameFilter} from '../../interfaces/Filters/UnownedGameFilter';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderByTitle} from '../../interfaces/OrderBy/OrderByTitle';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {CloudGameFilter} from '../../interfaces/Filters/CloudGameFilter';
import {PlatformGameFilter} from '../../interfaces/Filters/PlatformGameFilter';
import {GameFilterWithOptions} from '../../interfaces/Filters/GameFilterWithOptions';

@Component({
  selector: 'mm-browse-games',
  templateUrl: './browse-games.component.html',
  styleUrls: ['./browse-games.component.scss']
})
export class BrowseGamesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getBaseFilter(): GameFilter {
    return new UnownedGameFilter();
  }

  getChangeableFilters(): GameFilterWithOptions[] {
    return [new CloudGameFilter(),
      new PlatformGameFilter()];
  }

  getOrderings(): GameOrdering[] {
    return [
      new OrderByTitle(OrderingDirection.asc)
    ];
  }
}
