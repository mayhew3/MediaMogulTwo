import { Component, OnInit } from '@angular/core';
import {GameFilter} from '../../interfaces/GameFilter';
import {DashboardGameFilter} from '../../interfaces/DashboardGameFilter';
import {GameOrdering} from '../../interfaces/GameOrdering';
import {OrderByRating} from '../../interfaces/OrderByRating';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {OrderByLastPlayed} from '../../interfaces/OrderByLastPlayed';
import {OrderByDateAdded} from '../../interfaces/OrderByDateAdded';

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
