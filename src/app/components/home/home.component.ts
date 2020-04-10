import {Component, OnInit} from '@angular/core';
import {DashboardGameFilter} from '../../interfaces/DashboardGameFilter';
import {GameFilter} from '../../interfaces/GameFilter';
import {GameOrdering} from '../../interfaces/GameOrdering';
import {OrderByRating} from '../../interfaces/OrderByRating';
import {OrderingDirection} from '../game-list/OrderingDirection';
import {OrderByLastPlayed} from '../../interfaces/OrderByLastPlayed';

@Component({
  selector: 'mm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getDashboardFilter(): GameFilter {
    return new DashboardGameFilter();
  }

  // todo: add date_added ordering
  getOrderings(): GameOrdering[] {
    return [
      new OrderByRating(OrderingDirection.desc),
      new OrderByLastPlayed(OrderingDirection.desc)
    ];
  }
}
