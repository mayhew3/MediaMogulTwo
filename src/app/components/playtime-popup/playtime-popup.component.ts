import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';
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
  model: NgbDate;

  original = new GameTime();
  resulting = new GameTime();
  added = new GameTime();

  sessionRating: number;
  finished = false;

  finalScore: number;
  replayScore: number;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService,
              private calendar: NgbCalendar) {
    this.model = calendar.getToday();
  }

  ngOnInit(): void {
    this.original.initialize(this.game.personGame.minutes_played);
    this.finished = !!this.game.personGame.finished_date;
    this.finalScore = this.game.personGame.final_score;
    this.replayScore = this.game.personGame.replay_score;
  }

  newChanged() {
    this.added.duration = this.resulting.getDurationClone().subtract(this.original.duration);
  }

  addedChanged() {
    this.resulting.duration = this.added.getDurationClone().add(this.original.duration);
  }

  anyFieldsChanged() {
    const gametimeChanged = this.added.asMinutes() > 0;
    const finishedChanged = !this.finished !== !this.game.personGame.finished_date;
    const finalScoreChanged = this.finalScore !== this.game.personGame.final_score;
    const replayScoreChanged = this.replayScore !== this.game.personGame.replay_score;
    return gametimeChanged || finishedChanged || finalScoreChanged || replayScoreChanged;
  }

  async saveAndClose() {
    try {
      const momentObj = moment([this.model.year, this.model.month - 1, this.model.day]);
      const playedDate = momentObj.toDate();
      const changedFields = {
        minutes_played: this.resulting.asMinutes(),
        final_score: this.finalScore,
        replay_score: this.replayScore,
        last_played: playedDate,
        finished_date: this.finished ? playedDate : null
      };

      const gameplaySession = {
        minutes: this.added.asMinutes(),
        start_time: playedDate,
        rating: this.sessionRating,
        person_id: 1,
      };

      await this.gameService.insertGameplaySession(gameplaySession);
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
    return this._duration?.asMinutes();
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
