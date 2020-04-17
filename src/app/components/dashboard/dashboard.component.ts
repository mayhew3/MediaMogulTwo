import {Component, OnInit} from '@angular/core';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderByRating} from '../../interfaces/OrderBy/OrderByRating';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {OrderByLastPlayed} from '../../interfaces/OrderBy/OrderByLastPlayed';
import {OrderByDateAdded} from '../../interfaces/OrderBy/OrderByDateAdded';
import {FinishedGameFilter} from '../../interfaces/Filters/FinishedGameFilter';
import {GameFilterWithOptions} from '../../interfaces/Filters/GameFilterWithOptions';
import {CloudGameFilter} from '../../interfaces/Filters/CloudGameFilter';
import {PlatformGameFilter} from '../../interfaces/Filters/PlatformGameFilter';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {OwnedGameFilter} from '../../interfaces/Filters/OwnedGameFilter';

@Component({
  selector: 'mm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getBaseFilter(): GameFilter {
    return new OwnedGameFilter();
  }

  getChangeableFilters(): GameFilterWithOptions[] {
    return [new CloudGameFilter(),
      new PlatformGameFilter(),
      new FinishedGameFilter(),
    ];
  }

  getOrderings(): GameOrdering[] {
    return [
      new OrderByRating(OrderingDirection.desc),
      new OrderByLastPlayed(OrderingDirection.desc),
      new OrderByDateAdded(OrderingDirection.desc),
    ];
  }
}
