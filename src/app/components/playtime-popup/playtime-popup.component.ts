import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Game';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'mm-playtime-popup',
  templateUrl: './playtime-popup.component.html',
  styleUrls: ['./playtime-popup.component.scss']
})
export class PlaytimePopupComponent {
  @Input() game: Game;
  changedPlaytime: number;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService) { }

  async saveAndClose() {
    try {
      const changedFields = {minutes_played: this.changedPlaytime};
      await this.gameService.updatePersonGame(this.game, changedFields);
      this.activeModal.close('Save Click');
    } catch (err) {
      console.error(err);
    }
  }
}
