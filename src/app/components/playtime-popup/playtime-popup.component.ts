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

  original = new GameTime();
  resulting = new GameTime();
  added = new GameTime();

  sessionRating: number;
  finished = false;

  finalScore: number;
  replayScore: number;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService) { }

  ngOnInit(): void {
    this.original.initialize(this.game.personGame.minutes_played);
  }

  updateUIFieldsWithNewDurations() {
    this.changedPlaytime = this.resulting.asMinutes();
  }

  newChanged() {
    this.added.duration = this.resulting.getDurationClone().subtract(this.original.duration);
    this.updateUIFieldsWithNewDurations();
  }

  addedChanged() {
    this.resulting.duration = this.added.getDurationClone().add(this.original.duration);
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

class GameTime {
  // tslint:disable-next-line:variable-name
  private _duration: moment.Duration;
  // tslint:disable-next-line:variable-name
  private _hours: number;
  // tslint:disable-next-line:variable-name
  private _minutes: number;

  initialize(minutesPlayed: number) {
    this._duration = moment.duration(minutesPlayed, 'minutes');
    this.updateHoursAndMinutes();
  }

  get hours(): number {
    return this._hours;
  }

  set hours(newHours: number) {
    this._hours = newHours;
    this.updateDuration();
  }

  get minutes(): number {
    return this._minutes;
  }

  set minutes(newMinutes: number) {
    this._minutes = newMinutes;
    this.updateDuration();
  }

  get duration(): moment.Duration {
    return this._duration;
  }

  set duration(newDuration: moment.Duration) {
    this._duration = newDuration;
    this.updateHoursAndMinutes();
  }

  getDurationClone(): moment.Duration {
    return this._duration.clone();
  }

  asMinutes(): number {
    return this._duration.asMinutes();
  }

  private updateDuration() {
    const hoursDuration = moment.duration(!this._hours ? 0 : this._hours, 'hours');
    const minutesDuration = moment.duration(!this._minutes ? 0 : this._minutes, 'minutes');

    this._duration = hoursDuration.add(minutesDuration);
  }

  private updateHoursAndMinutes() {
    this._hours = Math.floor(this._duration.asHours());
    this._minutes = this._duration.minutes();
  }
}
