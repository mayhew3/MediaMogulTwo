import {Component, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {Game} from '../../interfaces/Model/Game';
import * as _ from 'underscore';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {DuplicateDetailComponent} from '../duplicate-detail/duplicate-detail.component';
import {FieldValue} from '../../interfaces/DataObject/FieldValue';
import {ArrayUtil} from '../../utility/ArrayUtil';

@Component({
  selector: 'mm-duplicate-resolution',
  templateUrl: './duplicate-resolution.component.html',
  styleUrls: ['./duplicate-resolution.component.scss']
})
export class DuplicateResolutionComponent implements OnInit {

  games: Game[];
  gameGroups: GameGroup[];

  closeResult = '';

  constructor(private gameService: GameService,
              private modalService: NgbModal) {
    this.gameService.games.subscribe(incomingGames => {
      this.games = incomingGames;
      this.splitGamesIntoGroups();
    });
  }

  ngOnInit(): void {
  }

  cardClass(gameGroup: GameGroup): string {
    if (!gameGroup.resolved) {
      return 'unresolvedCard';
    } else {
      return 'resolvedCard';
    }
  }

  splitGamesIntoGroups(): void {
    this.gameGroups = [];

    _.forEach(this.games, game => {
      const alreadyInGameGroup = _.findWhere(this.gameGroups, {igdb_id: game.igdb_id.value});

      if (!alreadyInGameGroup && !!game.igdb_id.value) {
        const matching = _.filter(this.games, otherGame => otherGame.igdb_id.value === game.igdb_id.value && otherGame.id.value !== game.id.value);
        if (matching.length > 0) {
          matching.push(game);
          const gameGroup = new GameGroup(matching);
          this.gameGroups.push(gameGroup);
        }
      }
    });
  }

  async openDetailPopup(gameGroup: GameGroup) {
    const modalRef = this.modalService.open(DuplicateDetailComponent, {size: 'lg'});
    modalRef.componentInstance.gameGroup = gameGroup;
    await this.handlePopupResult(modalRef);
  }

  async handlePopupResult(modalRef: NgbModalRef) {
    try {
      const result = await modalRef.result;
      this.closeResult = `Closed with: ${result}`;
    } catch (err) {
      this.closeResult = `Dismissed`;
    }
  }

}

export class GameGroup {
  igdb_id: number;
  gameToKeep: Game;
  fieldOverrides: any[] = [];
  resolved = false;

  constructor(private _games: Game[]) {
    this.igdb_id = _games[0].igdb_id.value;
  }

  get games(): Game[] {
    return this._games;
  }

  isGameToKeep(game: Game): boolean {
    return !!this.gameToKeep && game.id.value === this.gameToKeep.id.value;
  }

  overrideField(fieldName: string, fieldValue: any) {
    const payload = {
      name: fieldName,
      value: fieldValue,
    }
    this.fieldOverrides.push(payload);
  }

  getOverride(fieldName: string): any {
    const override = _.findWhere(this.fieldOverrides, {name: fieldName});
    return !override ? null : override.value;
  }

  isFieldToKeep(game: Game, fieldValue: FieldValue<any>): boolean {
    const gameUniversals = ['platform', 'metacritic', 'metacritic_page', 'metacritic_matched'];
    const override = this.getOverride(fieldValue.getFieldName());
    if (!!override) {
      return fieldValue.value === override;
    } else {
      return _.contains(gameUniversals, fieldValue.getFieldName()) ||
      this.isGameToKeep(game);
    }
  }

  getTitles(): string[] {
    const titles = _.map(this._games, game => game.title.value);
    return _.uniq(titles);
  }

  getPlatforms(): string[] {
    return _.map(this._games, game => game.platform.value);
  }

  getFirstPoster(): string[] {
    const posters = _.map(this._games, game => 'https://images.igdb.com/igdb/image/upload/t_720p/' + game.igdb_poster.value +  '.jpg');
    const compacted = _.compact(posters);
    return compacted.length > 0 ? compacted[0] : null;
  }

  getFieldsWithDifferences(): FieldValue<any>[] {
    const fieldsWithDiffs: FieldValue<any>[] = [];
    _.forEach(this._games[0].fieldValues, fieldValue => {
      const fieldName = fieldValue.getFieldName();
      const fieldsToExclude = ['title', 'id', 'date_added'];
      if (!_.contains(fieldsToExclude, fieldName)) {
        const allValuesForField = _.map(this._games, game => game.getFieldWithName(fieldName).value);
        const uniqued = _.uniq(allValuesForField);
        if (uniqued.length > 1) {
          fieldsWithDiffs.push(fieldValue);
        }
      }
    });
    return fieldsWithDiffs;
  }

  getPersonFieldsWithDifferences(): FieldValue<any>[] {
    const fieldsWithDiffs: FieldValue<any>[] = [];
    const gamesWithPerson = _.filter(this.games, game => !!game.personGame);
    if (gamesWithPerson.length == 0) {
      return [];
    } else {
      _.forEach(gamesWithPerson[0].personGame.fieldValues, fieldValue => {
        const fieldName = fieldValue.getFieldName();
        const fieldsToExclude = ['id', 'date_added'];
        if (!_.contains(fieldsToExclude, fieldName)) {
          const allValuesForField = _.map(gamesWithPerson, game => game.personGame.getFieldWithName(fieldName).value);
          const uniqued = _.uniq(allValuesForField);
          if (uniqued.length > 1) {
            fieldsWithDiffs.push(fieldValue);
          }
        }
      });
    }
    return fieldsWithDiffs;
  }

  async resolve() {
    this.resolved = true;
  }
}
