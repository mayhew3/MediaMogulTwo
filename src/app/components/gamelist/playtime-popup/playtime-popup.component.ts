import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../../interfaces/Model/Game';
import {GameService} from '../../../services/game.service';
import * as moment from 'moment';
import {PersonService} from '../../../services/person.service';
import {MyGamePlatform} from '../../../interfaces/Model/MyGamePlatform';
import * as _ from 'underscore';
import {GameTime} from '../../../interfaces/Utility/GameTime';
import {PlatformService} from '../../../services/platform.service';

@Component({
  selector: 'mm-playtime-popup',
  templateUrl: './playtime-popup.component.html',
  styleUrls: ['./playtime-popup.component.scss']
})
export class PlaytimePopupComponent implements OnInit {
  @Input() game_id: number;

  game: Game;
  model: NgbDate;
  validDate: boolean;

  original = new GameTime();
  resulting = new GameTime();
  added = new GameTime();

  gameplaySession = {
    rating: null
  };

  finished = false;

  selectedPlatform: MyGamePlatform;

  finalScore: number;
  replayScore: number;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService,
              private platformService: PlatformService,
              private calendar: NgbCalendar,
              private personService: PersonService) {
    this.model = calendar.getToday();
    this.validDate = true;
  }

  async ngOnInit(): Promise<any> {
    this.gameService.gameWithIDObservable(this.game_id).subscribe(game => {
      this.game = game;

      this.platformService.getMyPreferredPlatform(this.game).subscribe(myGamePlatform => {
        this.selectedPlatform = this.platformService.canAddToGame(myGamePlatform.availableGamePlatform) ?
          myGamePlatform :
          this.myMutablePlatforms[0];
        this.initializeDates();
        this.finished = !!this.selectedPlatform.data.finished_date;
        this.finalScore = this.selectedPlatform.data.final_score;
        this.replayScore = this.selectedPlatform.data.replay_score;
      });
    });
  }

  get myMutablePlatforms(): MyGamePlatform[] {
    return this.platformService.myMutablePlatforms(this.game);
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
    return platform.id === this.selectedPlatform.data.id;
  }

  platformsExceptSelected(): MyGamePlatform[] {
    return _.without(this.myMutablePlatforms, this.selectedPlatform);
  }

  selectPlatform(platform: MyGamePlatform): void {
    this.selectedPlatform = platform;
    this.initializeDates();
  }

  initializeDates(): void {
    this.original = new GameTime();
    this.resulting = new GameTime();
    this.added = new GameTime();
    this.original.initialize(this.selectedPlatform.data.minutes_played);
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
    /*const gametimeChanged = this.added.asMinutes() > 0;
    const finishedChanged = !this.finished !== !this.selectedPlatform.finished_date;
    const finalScoreChanged = this.finalScore !== this.selectedPlatform.final_score;
    const replayScoreChanged = this.replayScore !== this.selectedPlatform.replay_score;
    return gametimeChanged || finishedChanged || finalScoreChanged || replayScoreChanged;*/
    return false;
  }

  async saveAndClose(): Promise<void> {
    this.personService.me$.subscribe(async person => {
      try {
        /*const playedDate = this.convertModelToDate();
        const myPlatform = this.selectedPlatform;
        myPlatform.minutes_played = this.resulting.asMinutes();
        myPlatform.last_played = playedDate;
        myPlatform.finished_date = this.finished ? playedDate : null;

        this.gameplaySession.game_id = this.game.id;
        this.gameplaySession.minutes = this.added.asMinutes();
        this.gameplaySession.start_time = playedDate;
        this.gameplaySession.person_id = person.id;

        const resultSession = await this.gameService.insertGameplaySession(this.gameplaySession);
        await this.gameService.updateMyPlatform(myPlatform);
        this.activeModal.close(resultSession);*/
      } catch (err) {
        console.error(err);
      }
    });
  }

  dismiss(): void {
    // this.game.discardChanges();
    this.activeModal.dismiss('Cross Click');
  }

}
