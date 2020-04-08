import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Game';
import fast_sort from 'fast-sort';
import {GameSort} from './game.sort';

@Component({
  selector: 'mm-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit{
  @Input() title: string;
  @Input() games: Game[];
  @Input() pageSize: number;
  page = 1;
  orderings = new Map<GameSort, any>();
  selectedOrdering = GameSort.ByRating;
  initializing = true;

  constructor() {
    this.orderings.set(GameSort.ByRating, game => game.personGame.rating);
    this.orderings.set(GameSort.ByLastPlayed, game => game.personGame.last_played);
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
    fast_sort(this.games)
      .by([
        {desc: this.getCurrentOrdering()}
      ]);
  }

}
