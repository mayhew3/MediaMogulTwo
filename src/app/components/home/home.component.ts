import {Component, OnInit} from '@angular/core';
import {DashboardGameFilter} from '../../interfaces/DashboardGameFilter';
import {GameFilter} from '../../interfaces/GameFilter';
import {GameSort} from '../game-list/game.sort';

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

  getOrdering(): GameSort {
    return GameSort.ByRating;
  }
}
