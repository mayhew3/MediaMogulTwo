import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Game';
import fast_sort from 'fast-sort';
import {GameSort} from './game.sort';
import * as _ from 'underscore';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddGameComponent} from '../add-game/add-game.component';
import {GameService} from '../../services/game.service';
import {GameFilter} from '../../interfaces/GameFilter';

@Component({
  selector: 'mm-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit{
  @Input() title: string;
  @Input() pageSize: number;
  @Input() gameFilter: GameFilter;
  @Input() selectedOrdering: GameSort;
  filteredGames: Game[] = [];
  page = 1;
  orderings = new Map<GameSort, any>();
  orderingKeys: GameSort[];
  initializing = true;
  thisComponent = this;

  // todo: Ordering class that has asc/desc. Hand in all orderings, and first one is default.
  constructor(private modalService: NgbModal,
              private gameService: GameService) {
    this.orderings.set(GameSort.ByRating, game => !!game.personGame ? game.personGame.rating : undefined);
    this.orderings.set(GameSort.ByLastPlayed, game => !!game.personGame ? game.personGame.last_played : undefined);
    this.orderings.set(GameSort.ByTitle, game => game.title);
    this.orderingKeys = Array.from(this.orderings.keys());
  }

  async ngOnInit(): Promise<any> {
    await this.fastSortGames();
    this.initializing = false;
  }

  showOrderingDropdown(): boolean {
    return !this.initializing;
  }

  getCurrentOrdering(): any {
    return this.orderings.get(this.selectedOrdering);
  }

  async changeOrdering(ordering: GameSort) {
    this.selectedOrdering = ordering;
    await this.fastSortGames();
  }

  async fastSortGames() {
    const allGames = await this.gameService.maybeRefreshCache();
    this.filteredGames = _.filter(allGames, game => this.gameFilter.apply(game));
    // noinspection TypeScriptValidateJSTypes
    fast_sort(this.filteredGames)
      .by([
        {desc: this.getCurrentOrdering()}
      ]);
  }

  async openAddGamePopup() {
    const modalRef = this.modalService.open(AddGameComponent, {size: 'lg'});
    await modalRef.result;
    await this.fastSortGames();
  }

}
