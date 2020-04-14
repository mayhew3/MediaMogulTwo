import { Component, OnInit } from '@angular/core';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {DashboardGameFilter} from '../../interfaces/Filters/DashboardGameFilter';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderByRating} from '../../interfaces/OrderBy/OrderByRating';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {OrderByLastPlayed} from '../../interfaces/OrderBy/OrderByLastPlayed';
import {OrderByDateAdded} from '../../interfaces/OrderBy/OrderByDateAdded';

@Component({
  selector: 'mm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getDashboardFilter(): GameFilter {
    return new DashboardGameFilter();
  }

  getOrderings(): GameOrdering[] {
    return [
      new OrderByRating(OrderingDirection.desc),
      new OrderByLastPlayed(OrderingDirection.desc),
      new OrderByDateAdded(OrderingDirection.desc),
    ];
  }
}
