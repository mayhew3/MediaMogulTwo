import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Model/Game';
import {GameService} from '../../services/game.service';
import * as moment from 'moment';
import {PersonService} from '../../services/person.service';
import {GameplaySession} from '../../interfaces/Model/GameplaySession';

@Component({
  selector: 'mm-playtime-popup',
  templateUrl: './playtime-popup.component.html',
  styleUrls: ['./playtime-popup.component.scss']
})
export class PlaytimePopupComponent implements OnInit {
  @Input() game: Game;
  model: NgbDate;
  validDate: boolean;

  original = new GameTime();
  resulting = new GameTime();
  added = new GameTime();

  gameplaySession = new GameplaySession();

  sessionRating: number;
  finished = false;

  finalScore: number;
  replayScore: number;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService,
              private calendar: NgbCalendar,
              private personService: PersonService) {
    this.model = calendar.getToday();
    this.validDate = true;
  }

  async ngOnInit(): Promise<any> {
    this.original.initialize(this.game.personGame.minutes_played.value);
    this.finished = !!this.game.personGame.finished_date.value;
    this.finalScore = this.game.personGame.final_score.value;
    this.replayScore = this.game.personGame.replay_score.value;
  }

  newChanged() {
    this.added.duration = this.resulting.getDurationClone().subtract(this.original.duration);
  }

  addedChanged() {
    this.resulting.duration = this.added.getDurationClone().add(this.original.duration);
  }

  validateModel() {
    this.validDate = this.isValidDate();
  }

  convertModelToDate(): Date {
    const momentObj = moment([this.model.year, this.model.month - 1, this.model.day]);
    return momentObj.toDate();
  }

  isValidDate(): boolean {
    try {
      const converted = this.convertModelToDate();
      return converted instanceof Date && isFinite(converted.getTime());
    } catch (err) {
      return false;
    }
  }

  disableAdd(): boolean {
    return !this.anyFieldsChanged() ||
      !this.added.asMinutes() ||
      !this.validDate;
  }

  anyFieldsChanged() {
    const gametimeChanged = this.added.asMinutes() > 0;
    const finishedChanged = !this.finished !== !this.game.personGame.finished_date.value;
    const finalScoreChanged = this.finalScore !== this.game.personGame.final_score.value;
    const replayScoreChanged = this.replayScore !== this.game.personGame.replay_score.value;
    return gametimeChanged || finishedChanged || finalScoreChanged || replayScoreChanged;
  }

  async saveAndClose() {
    this.personService.me$.subscribe(async person => {
      try {
        const playedDate = this.convertModelToDate();
        const personGame = this.game.personGame;
        personGame.minutes_played.value = this.resulting.asMinutes();
        personGame.last_played.value = playedDate;
        personGame.finished_date.value = this.finished ? playedDate : null;

        this.gameplaySession.game_id.value = this.game.id.value;
        this.gameplaySession.minutes.value = this.added.asMinutes();
        this.gameplaySession.start_time.value = playedDate;
        this.gameplaySession.person_id.value = person.id.value;

        await this.gameService.insertGameplaySession(this.gameplaySession);
        await this.gameService.updatePersonGame(personGame);
        this.activeModal.close('Save Click');
      } catch (err) {
        console.error(err);
      }
    });
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
