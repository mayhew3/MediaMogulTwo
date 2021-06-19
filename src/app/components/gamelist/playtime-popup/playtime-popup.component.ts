import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbCalendar, NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../../interfaces/Model/Game';
import {GameplaySessionInsertObj, GameService, MyPlatformSessionUpdate} from '../../../services/game.service';
import * as moment from 'moment';
import {PersonService} from '../../../services/person.service';
import {MyGamePlatform} from '../../../interfaces/Model/MyGamePlatform';
import * as _ from 'underscore';
import {GameTime} from '../../../interfaces/Utility/GameTime';
import {PlatformService} from '../../../services/platform.service';
import {SocketService} from '../../../services/socket.service';
import {AddGameplaySessionMessage} from '../../../../shared/AddGameplaySessionMessage';
import {UpdateMyGamePlatformMessage} from '../../../../shared/UpdateMyGamePlatformMessage';

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

  addingSession = false;
  updatingMyPlatform = false;

  finalScore: number;
  replayScore: number;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService,
              private platformService: PlatformService,
              private calendar: NgbCalendar,
              private socketService: SocketService,
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

        this.socketService.on('add_gameplay_session', (msg: AddGameplaySessionMessage) => {
          if (msg.gameplaySession.game_id === game.id) {
            this.addingSession = false;
            if (!this.isUpdating()) {
              this.activeModal.close();
            }
          }
        });

        this.socketService.on('update_my_game_platform', (msg: UpdateMyGamePlatformMessage) => {
          if (msg.my_game_platform.id === this.selectedPlatform.id) {
            this.updatingMyPlatform = false;
            if (!this.isUpdating()) {
              this.activeModal.close();
            }
          }
        });
      });
    });
  }

  isUpdating(): boolean {
    return this.addingSession || this.updatingMyPlatform;
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

  onFinishedChanged(event): void {
    if (!event) {
      this.finalScore = undefined;
      this.replayScore = undefined;
    }
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
    const gameTimeChanged = this.added.asMinutes() > 0;
    const finishedChanged = !this.finished !== !this.selectedPlatform.data.finished_date;
    const finalScoreChanged = this.finalScore !== this.selectedPlatform.data.final_score;
    const replayScoreChanged = this.replayScore !== this.selectedPlatform.data.replay_score;
    return gameTimeChanged || finishedChanged || finalScoreChanged || replayScoreChanged;
  }

  async saveAndClose(): Promise<void> {
    this.personService.me$.subscribe(async person => {
      try {

        const playedDate = this.convertModelToDate();

        const platformUpdate: MyPlatformSessionUpdate = {
          minutes_played: this.resulting.asMinutes(),
          last_played: playedDate,
          finished_date: this.finished ? playedDate : null,
          final_score: this.finalScore,
          replay_score: this.replayScore
        };

        const insertSession: GameplaySessionInsertObj = {
          game_id: this.game.id,
          minutes: this.added.asMinutes(),
          start_time: playedDate,
          person_id: person.id,
          rating: this.gameplaySession.rating
        };

        this.addingSession = true;
        this.gameService.insertGameplaySession(insertSession);

        this.updatingMyPlatform = true;
        this.gameService.updateMyPlatform(this.selectedPlatform.id, platformUpdate);
      } catch (err) {
        console.error(err);
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss('Cross Click');
  }

}
