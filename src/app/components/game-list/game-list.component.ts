import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Model/Game';
import fast_sort from 'fast-sort';
import * as _ from 'underscore';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GameService} from '../../services/game.service';
import {GameFilter} from '../../interfaces/Filters/GameFilter';
import {GameOrdering} from '../../interfaces/OrderBy/GameOrdering';
import {OrderingDirection} from './OrderingDirection';
import {GameFilterWithOptions} from '../../interfaces/Filters/GameFilterWithOptions';
import {GameFilterOption} from '../../interfaces/Filters/GameFilterOption';
import {ArrayUtil} from '../../utility/ArrayUtil';

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
  nailedDownFilters: GameFilter[];
  nailedDownOrderings: GameOrdering[];
  selectedOrdering: GameOrdering;
  filteredGames: Game[] = [];
  page = 1;
  initializing = true;
  error: string;
  thisComponent = this;

  visibleOptions: Map<GameFilterWithOptions, GameFilterOption[]>;

  constructor(private modalService: NgbModal,
              private gameService: GameService) {
  }

  async ngOnInit(): Promise<any> {
    this.visibleOptions = new Map<GameFilterWithOptions, GameFilterOption[]>();
    this.selectedOrdering = this.orderings[0];
    this.nailedDownFilters = ArrayUtil.cloneArray(this.changeableFilters);
    this.nailedDownOrderings = ArrayUtil.cloneArray(this.orderings);
    this.sortAndFilterGames();
  }

  showOrderingDropdown(): boolean {
    return !this.initializing;
  }

  changeOrdering(ordering: GameOrdering): void {
    this.selectedOrdering = ordering;
    this.sortAndFilterGames();
  }

  sortAndFilterGames(): void {
    this.gameService.games.subscribe(allGames => {

      const allFilters = this.getAllFilters();
      this.filteredGames = this.applyAll(allGames, allFilters);
      this.sortGames();
      this.updateVisibleOptions(allGames);

      if (allGames.length > 0) {
        this.initializing = false;
      }
    });
  }

  /* eslint-disable @typescript-eslint/explicit-function-return-type */
  private sortGames(): void {
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

  applyAll(games: Game[], filters: GameFilter[]): Game[] {
    let filtered = ArrayUtil.cloneArray(games);
    _.forEach(filters, filter => {
      // bind() returns a copy of a function with 'this' bound to an object.
      filtered = _.filter(filtered, filter.apply.bind(filter));
    });
    return filtered;
  }

  private getAllFilters(): GameFilter[] {
    const allFilters = ArrayUtil.cloneArray(this.nailedDownFilters);
    if (!!this.baseFilter) {
      allFilters.push(this.baseFilter);
    }
    return allFilters;
  }

  getOptionClass(option: GameFilterOption): string {
    const classes = [];
    if (option.isActive) {
      classes.push('btn-success');
      classes.push('filterItem');
    }
    return classes.join(' ');
  }

  private getAllFiltersExcept(filter: GameFilterWithOptions): GameFilter[] {
    const allFilters = this.getAllFilters();
    return _.without(allFilters, filter);
  }

  updateVisibleOptions(games: Game[]): void {
    for (const filter of this.nailedDownFilters) {
      if (filter.hasOptions()) {
        const filterWithOptions = filter as GameFilterWithOptions;
        this.visibleOptions.set(filterWithOptions, this.getUsedOptionsOnly(filterWithOptions, games));
      }
    }
  }

  getUsedOptionsOnly(filter: GameFilterWithOptions, games: Game[]): GameFilterOption[] {
    const otherFilters = this.getAllFiltersExcept(filter);
    const filteredGames = this.applyAll(games, otherFilters);

    const filteredOptions: GameFilterOption[] = [];
    for (const option of filter.getRegularOptions()) {
      const gamesForOption = _.filter(filteredGames, game => filter.gamePassesOption(game, option));
      if (gamesForOption.length > 0) {
        filteredOptions.push(option);
      }
    }
    return filteredOptions;
  }

  toggleOption(option: GameFilterOption, parentFilter: GameFilterWithOptions): void {
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

    this.sortAndFilterGames();
  }

}
