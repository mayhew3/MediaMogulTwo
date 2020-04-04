import {Component, Input} from '@angular/core';
import {NgbActiveModal, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Game';
import {GameService} from '../../services/game.service';
import * as moment from 'moment';

@Component({
  selector: 'mm-playtime-popup',
  templateUrl: './playtime-popup.component.html',
  styleUrls: ['./playtime-popup.component.scss']
})
export class PlaytimePopupComponent {
  @Input() game: Game;
  changedPlaytime: number;
  model: NgbDateStruct;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService) { }

  async saveAndClose() {
    try {
      const momentObj = moment([this.model.year, this.model.month - 1, this.model.day]);
      const playedDate = momentObj.toDate();
      const changedFields = {minutes_played: this.changedPlaytime};
      await this.gameService.updatePersonGame(this.game, changedFields);
      this.activeModal.close('Save Click');
    } catch (err) {
      console.error(err);
    }
  }
}
