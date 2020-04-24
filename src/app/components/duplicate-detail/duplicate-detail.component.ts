import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {GameGroup} from '../duplicate-resolution/duplicate-resolution.component';
import * as _ from 'underscore';
import {Game} from '../../interfaces/Model/Game';
import {FieldValue} from '../../interfaces/DataObject/FieldValue';

@Component({
  selector: 'mm-duplicate-detail',
  templateUrl: './duplicate-detail.component.html',
  styleUrls: ['./duplicate-detail.component.scss']
})
export class DuplicateDetailComponent implements OnInit {
  @Input() gameGroup: GameGroup;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.calculateChanges();
  }

  calculateChanges(): void {
    const fieldsToKeep = ['timetotal'];
    if (this.shouldKeepSteam()) {
      this.gameGroup.gameToKeep = this.getSingleGameWithPlatform('Steam');
    }
    _.forEach(fieldsToKeep, fieldName => {
      const allFields = _.map(this.gameGroup.games, game => game.getFieldWithName(fieldName));
      const distinctVals = _.compact(_.uniq(_.map(allFields, field => field.value)));
      if (distinctVals.length === 1) {
        const valueToKeep = distinctVals[0];
        this.gameGroup.overrideField(fieldName, valueToKeep);
      }
    });
  }

  titleClass(game: Game): string {
    const keptTitle = !this.gameGroup.gameToKeep ? null : this.gameGroup.gameToKeep.title.value;
    if (keptTitle === game.title.value) {
      return 'keepCell';
    } else {
      return '';
    }
  }

  colClass(game: Game): string {
    if (this.gameGroup.isGameToKeep(game)) {
      return 'keepCell';
    } else {
      return '';
    }
  }

  colClassForField(game: Game, fieldName: string): string {
    const field = game.getFieldWithName(fieldName);
    if (this.gameGroup.isFieldToKeep(game, field)) {
      return 'keepCell';
    } else {
      return '';
    }
  }

  colClassForPersonField(game: Game, fieldValue: FieldValue<any>): string {
    return 'keepCell';
  }

  shouldKeepSteam() {
    const steamGames = this.getGamesWithPlatform('Steam');
    const titles = this.gameGroup.getTitles();

    return steamGames.length === 1 && titles.length === 1;
  }

  getGamesWithPlatform(platformName: string): Game[] {
    return _.filter(this.gameGroup.games, game => game.platform.value === platformName);
  }

  getSingleGameWithPlatform(platformName: string): Game {
    const matching = this.getGamesWithPlatform(platformName);
    if (matching.length > 1) {
      throw new Error(`Found multiple matches for platform: ${platformName}`);
    } else if (matching.length === 1) {
      return matching[0];
    } else {
      return undefined;
    }
  }

  submitAndClose() {
    this.activeModal.close('Submit click');
  }

  dismiss() {
    this.activeModal.dismiss('Cross Click');
  }

}
