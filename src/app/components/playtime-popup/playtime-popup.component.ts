import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Model/Game';
import {GameService} from '../../services/game.service';
import * as moment from 'moment';
import {PersonService} from '../../services/person.service';
import {GameplaySession} from '../../interfaces/Model/GameplaySession';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';
import * as _ from 'underscore';
import {GameTime} from '../../interfaces/Utility/GameTime';

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

  finished = false;

  selectedPlatform: MyGamePlatform;

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
    this.selectedPlatform = this.game.myPreferredPlatform.canAddPlaytime() ?
      this.game.myPreferredPlatform :
      this.game.myMutablePlatforms[0];
    this.initializeDates();
    this.finished = !!this.selectedPlatform.finished_date.value;
    this.finalScore = this.selectedPlatform.final_score.value;
    this.replayScore = this.selectedPlatform.replay_score.value;
  }

  newChanged(): void {
    this.added.duration = this.resulting.getDurationClone().subtract(this.original.duration);
  }

  addedChanged(): void {
    this.resulting.duration = this.added.getDurationClone().add(this.original.duration);
  }

  validateModel(): void {
    this.validDate = this.isValidDate();
  }

  platformIsSelected(platform: MyGamePlatform): boolean {
    return platform.id.originalValue === this.selectedPlatform.id.originalValue;
  }

  platformsExceptSelected(): MyGamePlatform[] {
    return _.without(this.game.myMutablePlatforms, this.selectedPlatform);
  }

  selectPlatform(platform: MyGamePlatform): void {
    this.selectedPlatform = platform;
    this.initializeDates();
  }

  initializeDates(): void {
    this.original = new GameTime();
    this.resulting = new GameTime();
    this.added = new GameTime();
    this.original.initialize(this.selectedPlatform.minutes_played.value);
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

  anyFieldsChanged(): boolean {
    const gametimeChanged = this.added.asMinutes() > 0;
    const finishedChanged = !this.finished !== !this.selectedPlatform.finished_date.value;
    const finalScoreChanged = this.finalScore !== this.selectedPlatform.final_score.value;
    const replayScoreChanged = this.replayScore !== this.selectedPlatform.replay_score.value;
    return gametimeChanged || finishedChanged || finalScoreChanged || replayScoreChanged;
  }

  async saveAndClose(): Promise<void> {
    this.personService.me$.subscribe(async person => {
      try {
        const playedDate = this.convertModelToDate();
        const myPlatform = this.selectedPlatform;
        myPlatform.minutes_played.value = this.resulting.asMinutes();
        myPlatform.last_played.value = playedDate;
        myPlatform.finished_date.value = this.finished ? playedDate : null;

        this.gameplaySession.game_id = this.game.id.value;
        this.gameplaySession.minutes = this.added.asMinutes();
        this.gameplaySession.start_time = playedDate;
        this.gameplaySession.person_id = person.id;

        await this.gameService.insertGameplaySession(this.gameplaySession);
        await this.gameService.updateMyPlatform(myPlatform);
        this.activeModal.close();
      } catch (err) {
        console.error(err);
      }
    });
  }

  dismiss(): void {
    this.game.discardChanges();
    this.activeModal.dismiss('Cross Click');
  }

}
