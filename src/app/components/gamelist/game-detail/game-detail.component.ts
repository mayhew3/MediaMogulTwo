import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../../services/game.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PersonService} from '../../../services/person.service';
import {Game} from '../../../interfaces/Model/Game';
import {PlatformService} from '../../../services/platform.service';
import {GamePlatform} from '../../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGamePlatform} from '../../../interfaces/Model/MyGamePlatform';
import {AddPlatformsComponent} from '../add-platforms/add-platforms.component';
import {GameTime} from '../../../interfaces/Utility/GameTime';
import {PlaytimePopupComponent} from '../playtime-popup/playtime-popup.component';
import {GameplaySession} from '../../../interfaces/Model/GameplaySession';
import {GameplaySessionService} from '../../../services/gameplay.session.service';
import { inPlaceSort } from 'fast-sort';
import {AvailableGamePlatform} from '../../../interfaces/Model/AvailableGamePlatform';
import {Store} from '@ngxs/store';
import {SocketService} from '../../../services/socket.service';

enum DetailNav {RATING = 'Rating', PLAYTIME = 'Playtime'}

@Component({
  selector: 'mm-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @Input() game_id: number;

  game: Game;

  changedGameFields = {
    metacritic_hint: undefined,
    natural_end: undefined,
    howlong_id: undefined,
    giantbomb_id: undefined,
    title: undefined
  };
  changedPersonFields = {
    rating: undefined,
    final_score: undefined,
    replay_score: undefined,
    finished_date: undefined
  };
  finished = false;

  editedTitle: string;

  titleEditMode = false;

  selectedPlatformID: number;
  selectedPlatform: MyGamePlatform;

  allPlatforms: GamePlatform[] = [];

  platformNav = DetailNav.RATING;

  original = new GameTime();
  timeTotal = new GameTime();

  updatingMyGame = false;
  updatingGame = false;

  debug = false;

  gameplaySessions: GameplaySession[] = [];

  constructor(private gameService: GameService,
              private modalService: NgbModal,
              public activeModal: NgbActiveModal,
              public personService: PersonService,
              private store: Store,
              private platformService: PlatformService,
              private socketService: SocketService,
              private gameplaySessionService: GameplaySessionService) {
    this.platformService.platforms.subscribe(platforms => ArrayUtil.refreshArray(this.allPlatforms, platforms));
  }

  ngOnInit(): void {
    this.gameplaySessionService.refreshGameplaySessions(this.game_id).subscribe();

    this.gameService.gameWithIDObservable(this.game_id).subscribe(game => {
      this.game = game;

      if (!this.selectedPlatformID) {
        this.selectedPlatform = this.game.myPreferredPlatform;
        this.selectedPlatformID = this.selectedPlatform.id;
      } else {
        this.selectedPlatform = this.game.getMyPlatformWithID(this.selectedPlatformID);
      }

      this.initializePlatformUIFields(this.selectedPlatform);
      this.initializeDates(this.selectedPlatform);
      this.initializeGameUIFields();

      if (!!game.data.sessions) {
        const sessions = game.data.sessions;
        ArrayUtil.refreshArray(this.gameplaySessions, sessions);
        this.sortSessions();
      }

      this.initializeListeners();

    });
  }

  initializePlatformUIFields(myGamePlatform: MyGamePlatform): void {

    this.changedPersonFields.rating = myGamePlatform.data.rating;
    this.changedPersonFields.final_score = myGamePlatform.data.final_score;
    this.changedPersonFields.replay_score = myGamePlatform.data.replay_score;
    this.changedPersonFields.finished_date = myGamePlatform.data.finished_date;

    this.finished = !!myGamePlatform && !!myGamePlatform.data.finished_date;

  }

  initializeGameUIFields(): void {

    this.changedGameFields.metacritic_hint = this.game.data.metacritic_hint;
    this.changedGameFields.natural_end = this.game.data.natural_end;
    this.changedGameFields.howlong_id = this.game.data.howlong_id;
    this.changedGameFields.giantbomb_id = this.game.data.giantbomb_id;
    this.changedGameFields.title = this.game.data.title;

  }

  initializeListeners(): void {

    this.socketService.on('update_my_game_platform', msg => {
      if (msg.my_game_platform.id === this.selectedPlatform.id) {
        this.updatingMyGame = false;
        if (!this.isUpdating()) {
          this.activeModal.close('Update Click');
        }
      }
    });

    this.socketService.on('update_game', msg => {
      if (msg.game.id === this.game.id) {
        this.updatingGame = false;
        if (!this.isUpdating()) {
          this.activeModal.close('Update Click');
        }
      }
    });

  }

  isUpdating(): boolean {
    return this.updatingGame || this.updatingMyGame;
  }

  sortSessions(): void {
    inPlaceSort(this.gameplaySessions)
      .desc(session => session.start_time);
  }

  toggleTitleEdit(): void {
    this.titleEditMode = !this.titleEditMode;
  }

  showProgressBar(): boolean {
    return this.game.isOwned() && this.game.data.natural_end && this.game.getProgressPercent() !== undefined;
  }

  hasMultiplePlatforms(): boolean {
    return this.game.myPlatformsInGlobal.length > 1;
  }

  selectedIsPreferred(): boolean {
    return this.selectedPlatform.id === this.game.myPreferredPlatform.id;
  }

  getRatingOption(): DetailNav {
    return DetailNav.RATING;
  }

  getPlaytimeOption(): DetailNav {
    return DetailNav.PLAYTIME;
  }

  getFilteredSessions(): GameplaySession[] {
    return _.filter(this.gameplaySessions, gameplaySession => _.last(this.gameplaySessions) === gameplaySession || gameplaySession.minutes > 2);
  }

  getPillClass(detailOption: DetailNav): string {
    return detailOption === this.platformNav ? 'selectedPill' : '';
  }

  selectedPlatformChanged(event): void {
    this.selectedPlatformID = event.nextId.id;
    this.initializePlatformUIFields(event.nextId);
    this.initializeDates(event.nextId);
  }

  changePreferredPlatform(): void {
    this.gameService.changePreferredPlatform(this.selectedPlatform.id);
  }

  get addablePlatforms(): AvailableGamePlatform[] {
    return this.platformService.addablePlatforms(this.game);
  }

  showAddButton(): boolean {
    return this.addablePlatforms.length > this.platformService.myMutablePlatforms(this.game).length;
  }

  getMetacritic(): number {
    return this.selectedPlatform.availableGamePlatform.data.metacritic;
  }

  anyFieldsChanged(): boolean {
    return this.anyGameFieldsChanged() || this.anyMyGamePlatformFieldsChanged();
  }

  anyMyGamePlatformFieldsChanged(): boolean {
    return (
      this.changedPersonFields.rating !== this.selectedPlatform.data.rating ||
      this.changedPersonFields.final_score !== this.selectedPlatform.data.final_score ||
      this.changedPersonFields.replay_score !== this.selectedPlatform.data.replay_score ||
      this.changedPersonFields.finished_date !== this.selectedPlatform.data.finished_date
    );
  }

  anyGameFieldsChanged(): boolean {
    let changes = 0;
    for (const key in this.changedGameFields) {
      if (Object.prototype.hasOwnProperty.call(this.changedGameFields, key)) {
        if (this.game.data[key] !== this.changedGameFields[key]) {
          changes++;
        }
      }
    }
    return changes > 0;
  }

  onFinishedFieldEdit(event): void {
    this.finished = event;
    this.changedPersonFields.finished_date = !!this.finished ? new Date() : undefined;
    this.changedPersonFields.final_score = undefined;
    this.changedPersonFields.replay_score = undefined;
  }

  onNaturalEndEdit(event): void {
    this.changedGameFields.natural_end = event;
  }

  anyPlatformsAreFinished(): boolean {
    const finishedPlatform = _.find(this.game.myPlatformsInGlobal, myPlatform => this.isFinished(myPlatform));
    return !!finishedPlatform;
  }

  isFinished(myPlatform: MyGamePlatform): boolean {
    return !!myPlatform.data.finished_date;
  }

  hasSelectedPlatform(): boolean {
    return !!this.selectedPlatform;
  }

  async openAddPlatformsPopup(): Promise<void> {
    const modalRef = this.modalService.open(AddPlatformsComponent, {size: 'md'});
    modalRef.componentInstance.game_id = this.game.id;
    const resultPlatform = await modalRef.result;
    if (!!resultPlatform) {
      this.selectedPlatform = resultPlatform;
    }
  }

  async changeValues(): Promise<void> {
    if (this.anyMyGamePlatformFieldsChanged()) {
      this.updatingMyGame = true;
      this.doPersonUpdate();
    }

    if (this.anyGameFieldsChanged()) {
      this.updatingGame = true;
      this.doGameUpdate();
    }
  }

  dismiss(): void {
    this.activeModal.dismiss('Cross Click');
  }

  doPersonUpdate(): void {
    if (!this.changedPersonFields.finished_date) {
      this.changedPersonFields.finished_date = null;
    }
    if (!this.changedPersonFields.final_score) {
      this.changedPersonFields.final_score = null;
    }
    if (!this.changedPersonFields.replay_score) {
      this.changedPersonFields.replay_score = null;
    }
    this.gameService.updateMyPlatform(this.selectedPlatform.id, this.changedPersonFields);
  }

  doGameUpdate(): void {
    this.gameService.updateGame(this.game.id, this.changedGameFields);
  }

  // PLAYTIME

  showPlaytimeButton(): boolean {
    return this.platformService.canAddToGame(this.selectedPlatform.availableGamePlatform);
  }

  async openPlaytimePopup(): Promise<void> {
    const modalRef = this.modalService.open(PlaytimePopupComponent, {size: 'lg'});
    modalRef.componentInstance.game_id = this.game.id;
    const resultSession = await modalRef.result;
    this.gameplaySessions.push(resultSession);
    this.sortSessions();
    this.initializeDates(this.selectedPlatform);
  }

  initializeDates(selectedPlatform: MyGamePlatform): void {
    this.original = new GameTime();
    this.timeTotal = new GameTime();
    this.original.initialize(selectedPlatform.data.minutes_played);
    this.timeTotal.initialize(this.game.minutesToFinish);
  }

}
