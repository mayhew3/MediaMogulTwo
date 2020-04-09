import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Game';
import fast_sort from 'fast-sort';
import {GameSort} from './game.sort';
import * as _ from 'underscore';

@Component({
  selector: 'mm-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit{
  @Input() title: string;
  @Input() games: Game[];
  @Input() pageSize: number;
  filteredGames: Game[] = [];
  page = 1;
  orderings = new Map<GameSort, any>();
  orderingKeys: GameSort[];
  selectedOrdering = GameSort.ByRating;
  initializing = true;
  thisComponent = this;

  constructor() {
    this.orderings.set(GameSort.ByRating, game => game.personGame.rating);
    this.orderings.set(GameSort.ByLastPlayed, game => game.personGame.last_played);
    this.orderingKeys = Array.from(this.orderings.keys());
  }

  ngOnInit(): void {
    this.fastSortGames();
    this.initializing = false;
  }

  showOrderingDropdown(): boolean {
    return !this.initializing;
  }

  getCurrentOrdering(): any {
    return this.orderings.get(this.selectedOrdering);
  }

  changeOrdering(ordering: GameSort) {
    this.selectedOrdering = ordering;
    this.fastSortGames();
  }

  fastSortGames(): void {
    this.filteredGames = _.filter(this.games, game => !game.personGame.finished_date);
    fast_sort(this.filteredGames)
      .by([
        {desc: this.getCurrentOrdering()}
      ]);
  }

}
