import {Component, OnInit} from '@angular/core';
import {GameFilter} from '../../interfaces/GameFilter';
import {UnownedGameFilter} from '../../interfaces/UnownedGameFilter';
import {GameOrdering} from '../../interfaces/GameOrdering';
import {OrderByTitle} from '../../interfaces/OrderByTitle';
import {OrderingDirection} from '../game-list/OrderingDirection';

@Component({
  selector: 'mm-browse-games',
  templateUrl: './browse-games.component.html',
  styleUrls: ['./browse-games.component.scss']
})
export class BrowseGamesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getFilter(): GameFilter {
    return new UnownedGameFilter();
  }

  getOrderings(): GameOrdering[] {
    return [
      new OrderByTitle(OrderingDirection.asc)
    ];
  }
}
