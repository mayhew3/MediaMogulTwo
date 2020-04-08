import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Game';
import fast_sort from 'fast-sort';

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
  orderings = new Map<string, any>();
  selectedOrdering = 'lastPlayed';

  constructor() { }

  ngOnInit(): void {
    this.orderings.set('rating', game => game.personGame.rating);
    this.orderings.set('lastPlayed', game => game.personGame.last_played);
    this.fastSortGames();
  }

  getCurrentOrdering(): any {
    return this.orderings.get(this.selectedOrdering);
  }

  fastSortGames(): void {
    fast_sort(this.games)
      .by([
        {desc: this.getCurrentOrdering()}
      ]);
  }

}
