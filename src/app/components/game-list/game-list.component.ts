import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Game';
import fast_sort from 'fast-sort';
import * as _ from 'underscore';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddGameComponent} from '../add-game/add-game.component';
import {GameService} from '../../services/game.service';
import {GameFilter} from '../../interfaces/GameFilter';
import {GameOrdering} from '../../interfaces/GameOrdering';
import {OrderingDirection} from './OrderingDirection';
import {PlatformGameFilter} from '../../interfaces/PlatformGameFilter';
import {GameFilterWithOptions} from '../../interfaces/GameFilterWithOptions';
import {GameFilterOption} from '../../interfaces/GameFilterOption';

@Component({
  selector: 'mm-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit{
  @Input() title: string;
  @Input() pageSize: number;
  @Input() gameFilter: GameFilter;
  @Input() orderings: GameOrdering[];
  selectedOrdering: GameOrdering;
  filteredGames: Game[] = [];
  page = 1;
  initializing = true;
  thisComponent = this;
  platformFilter = new PlatformGameFilter();
  additionalFilters: GameFilterWithOptions[] = [
    this.platformFilter
  ];

  constructor(private modalService: NgbModal,
              private gameService: GameService) {
  }

  async ngOnInit(): Promise<any> {
    this.selectedOrdering = this.orderings[0];
    await this.fastSortGames();
    this.initializing = false;
  }

  showOrderingDropdown(): boolean {
    return !this.initializing;
  }

  isSelected(ordering: GameOrdering): boolean {
    return ordering.displayName === this.selectedOrdering.displayName;
  }

  async changeOrdering(ordering: GameOrdering) {
    this.selectedOrdering = ordering;
    await this.fastSortGames();
  }

  async fastSortGames() {
    const allGames = await this.gameService.maybeRefreshCache();
    this.filteredGames = _.filter(allGames, game => this.gameFilter.apply(game));
    const isAscending = OrderingDirection[this.selectedOrdering.direction] === OrderingDirection.asc;
    if (isAscending) {
      // noinspection TypeScriptValidateJSTypes
      fast_sort(this.filteredGames)
        .by([
          {asc: this.selectedOrdering.sortValue},
          {asc: game => game.title}
        ]);
    } else {
      // noinspection TypeScriptValidateJSTypes
      fast_sort(this.filteredGames)
        .by([
          {desc: this.selectedOrdering.sortValue},
          {asc: game => game.title}
        ]);
    }
  }

  getOptionClass(option: GameFilterOption): string {
    const classes = [];
    if (option.isActive) {
      classes.push('btn-success');
      classes.push('filterItem');
    }
    return classes.join(' ');
  }

  toggleOption(option: GameFilterOption) {
    option.isActive = !option.isActive;
  }

  async openAddGamePopup() {
    const modalRef = this.modalService.open(AddGameComponent, {size: 'lg'});
    await modalRef.result;
    await this.fastSortGames();
  }

}
