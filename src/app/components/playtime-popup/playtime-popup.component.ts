import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Game';
import {GameService} from '../../services/game.service';
import * as moment from 'moment';

@Component({
  selector: 'mm-playtime-popup',
  templateUrl: './playtime-popup.component.html',
  styleUrls: ['./playtime-popup.component.scss']
})
export class PlaytimePopupComponent implements OnInit {
  @Input() game: Game;
  changedPlaytime: number;
  model: NgbDateStruct;

  originalDuration: moment.Duration;
  originalHours: number;
  originalMinutes: number;

  newDuration: moment.Duration;
  newHours: number;
  newMinutes: number;

  addedDuration: moment.Duration;
  addedHours: number;
  addedMinutes: number;

  sessionRating: number;
  finished = false;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService) { }

  ngOnInit(): void {
    this.originalDuration = moment.duration(this.game.personGame.minutes_played, 'minutes');
    this.originalHours = Math.floor(this.originalDuration.asHours());
    this.originalMinutes = this.originalDuration.minutes();
  }

  updateUIFieldsWithNewDurations() {
    this.addedHours = Math.floor(this.addedDuration.asHours());
    this.addedMinutes = this.addedDuration.minutes();

    this.newHours = Math.floor(this.newDuration.asHours());
    this.newMinutes = this.newDuration.minutes();

    this.changedPlaytime = this.newDuration.asMinutes();
  }

  newChanged() {
    const hoursDuration = moment.duration(!this.newHours ? 0 : this.newHours, 'hours');
    const minutesDuration = moment.duration(!this.newMinutes ? 0 : this.newMinutes, 'minutes');

    this.newDuration = hoursDuration.add(minutesDuration);
    this.addedDuration = this.newDuration.clone().subtract(this.originalDuration);

    this.updateUIFieldsWithNewDurations();
  }

  addedChanged() {
    const hoursDuration = moment.duration(!this.addedHours ? 0 : this.addedHours, 'hours');
    const minutesDuration = moment.duration(!this.addedMinutes ? 0 : this.addedMinutes, 'minutes');

    this.addedDuration = hoursDuration.add(minutesDuration);
    this.newDuration = this.addedDuration.clone().add(this.originalDuration);

    this.updateUIFieldsWithNewDurations();
  }

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
