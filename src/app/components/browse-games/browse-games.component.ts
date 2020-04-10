import { Component, OnInit } from '@angular/core';
import {GameFilter} from '../../interfaces/GameFilter';
import {DashboardGameFilter} from '../../interfaces/DashboardGameFilter';
import {UnownedGameFilter} from '../../interfaces/UnownedGameFilter';

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
}
