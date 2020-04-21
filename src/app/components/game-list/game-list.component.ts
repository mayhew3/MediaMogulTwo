import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Model/Game';
import fast_sort from 'fast-sort';
import * as _ from 'underscore';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddGameComponent} from '../add-game/add-game.component';
import {GameService} from '../../services/game.service';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderingDirection} from './OrderingDirection';
import {GameFilterWithOptions} from '../../interfaces/Filters/GameFilterWithOptions';
import {GameFilterOption} from '../../interfaces/Filters/GameFilterOption';
import {ArrayService} from '../../services/array.service';

@Component({
  selector: 'mm-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit{
  @Input() title: string;
  @Input() pageSize: number;
  @Input() baseFilter: GameFilter;
  @Input() changeableFilters: GameFilterWithOptions[];
  @Input() orderings: GameOrdering[];
  nailedDownFilters: GameFilterWithOptions[];
  selectedOrdering: GameOrdering;
  filteredGames: Game[] = [];
  page = 1;
  initializing = true;
  error: string;
  thisComponent = this;

  constructor(private modalService: NgbModal,
              private gameService: GameService,
              private arrayService: ArrayService) {
  }

  async ngOnInit(): Promise<any> {
    this.selectedOrdering = this.orderings[0];
    this.nailedDownFilters = this.arrayService.cloneArray(this.changeableFilters);
    this.fastSortGames();
  }

  showOrderingDropdown(): boolean {
    return !this.initializing;
  }

  isSelected(ordering: GameOrdering): boolean {
    return ordering.displayName === this.selectedOrdering.displayName;
  }

  async changeOrdering(ordering: GameOrdering) {
    this.selectedOrdering = ordering;
    this.fastSortGames();
  }

  applyAll(games: Game[], filters: GameFilter[]): Game[] {
    let filtered = this.arrayService.cloneArray(games);
    _.forEach(filters, filter => {
      // bind() returns a copy of a function with 'this' bound to an object.
      filtered = _.filter(filtered, filter.apply.bind(filter))
    });
    return filtered;
  }

  fastSortGames() {
    this.gameService.games.subscribe(allGames => {
      const allFilters = this.arrayService.cloneArray(this.nailedDownFilters);
      if (!!this.baseFilter) {
        allFilters.push(this.baseFilter);
      }
      this.filteredGames = this.applyAll(allGames, allFilters);
      const isAscending = OrderingDirection[this.selectedOrdering.direction] === OrderingDirection.asc;
      if (isAscending) {
        // noinspection TypeScriptValidateJSTypes
        fast_sort(this.filteredGames)
          .by([
            {asc: this.selectedOrdering.sortValue},
            {asc: game => game.title.value}
          ]);
      } else {
        // noinspection TypeScriptValidateJSTypes
        fast_sort(this.filteredGames)
          .by([
            {desc: this.selectedOrdering.sortValue},
            {asc: game => game.title.value}
          ]);
      }
      if (allGames.length > 0) {
        this.initializing = false;
      }
    });
  }

  getOptionClass(option: GameFilterOption): string {
    const classes = [];
    if (option.isActive) {
      classes.push('btn-success');
      classes.push('filterItem');
    }
    return classes.join(' ');
  }

  toggleOption(option: GameFilterOption, parentFilter: GameFilterWithOptions) {
    const regularOptions = _.where(parentFilter.options, {special: false});
    const specialOptions = _.where(parentFilter.options, {special: true});
    if (option.special) {
      const expectedValue = (option.label === 'All');
      _.forEach(regularOptions, childOption => childOption.isActive = expectedValue);
    } else {
      option.isActive = !option.isActive;
    }
    const activeRegular = _.where(regularOptions, {isActive: true});
    const inactiveRegular = _.where(regularOptions, {isActive: false});
    const allOption = _.findWhere(specialOptions, {label: 'All'});
    const noneOption = _.findWhere(specialOptions, {label: 'None'});
    if (!!allOption) {
      allOption.isActive = inactiveRegular.length === 0;
    }
    if (!!noneOption) {
      noneOption.isActive = activeRegular.length === 0;
    }

    this.fastSortGames();
  }

}
