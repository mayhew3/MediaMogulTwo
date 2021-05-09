import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Model/Game';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';
import {AddPlatformsComponent} from '../add-platforms/add-platforms.component';
import {GameTime} from '../../interfaces/Utility/GameTime';
import {PlaytimePopupComponent} from '../playtime-popup/playtime-popup.component';
import {GameplaySession} from '../../interfaces/Model/GameplaySession';
import {GameplaySessionService} from '../../services/gameplay.session.service';
import fast_sort from 'fast-sort';

enum DetailNav {RATING = 'Rating', PLAYTIME = 'Playtime'}

@Component({
  selector: 'mm-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @Input() game: Game;

  changedGameFields = {};
  changedPersonFields = {};
  finished = false;

  editedTitle;

  titleEditMode = false;

  selectedPlatform: MyGamePlatform;

  allPlatforms: GamePlatform[] = [];

  platformNav = DetailNav.RATING;

  original = new GameTime();
  timeTotal = new GameTime();

  debug = false;

  gameplaySessions: GameplaySession[] = [];

  constructor(private gameService: GameService,
              private modalService: NgbModal,
              public activeModal: NgbActiveModal,
              public personService: PersonService,
              private platformService: PlatformService,
              private gameplaySessionService: GameplaySessionService) {
    this.platformService.platforms.subscribe(platforms => ArrayUtil.refreshArray(this.allPlatforms, platforms));
    this.platformService.maybeRefreshCache();
  }

  ngOnInit(): void {
    this.selectedPlatform = this.game.myPreferredPlatform;
    this.finished = !!this.selectedPlatform && !!this.selectedPlatform.finished_date.value;
    this.editedTitle = this.game.title.value;
    this.initializeDates(this.selectedPlatform);

    this.gameplaySessionService.getGameplaySessions(this.game).subscribe(sessions => {
      ArrayUtil.refreshArray(this.gameplaySessions, sessions);
      this.sortSessions();
    });
  }

  sortSessions(): void {
    fast_sort(this.gameplaySessions)
      .desc(session => session.start_time);
  }

  toggleTitleEdit(): void {
    this.titleEditMode = !this.titleEditMode;
  }

  showProgressBar(): boolean {
    return this.game.isOwned() && this.game.natural_end.originalValue && this.game.getProgressPercent() !== undefined;
  }

  hasMultiplePlatforms(): boolean {
    return this.game.myPlatformsInGlobal.length > 1;
  }

  selectedIsPreferred(): boolean {
    return this.selectedPlatform.id.originalValue === this.game.myPreferredPlatform.id.originalValue;
  }

  getRatingOption(): DetailNav {
    return DetailNav.RATING;
  }

  getPlaytimeOption(): DetailNav {
    return DetailNav.PLAYTIME;
  }

  getFilteredSessions(): GameplaySession[] {
    return _.filter(this.gameplaySessions, gameplaySession => _.last(this.gameplaySessions) === gameplaySession || gameplaySession.minutes.originalValue > 2);
  }

  getPillClass(detailOption: DetailNav): string {
    return detailOption === this.platformNav ? 'selectedPill' : '';
  }

  selectedPlatformChanged(event): void {
    this.initializeDates(event.nextId);
  }

  async changePreferredPlatform(): Promise<void> {
    this.game.myPreferredPlatform.preferred.value = false;
    await this.gameService.updateMyPlatform(this.game.myPreferredPlatform);

    this.selectedPlatform.preferred.value = true;
    await this.gameService.updateMyPlatform(this.selectedPlatform);
  }

  showAddButton(): boolean {
    return this.game.addablePlatforms.length > this.game.myMutablePlatforms.length;
  }

  getMetacritic(): number {
    return this.selectedPlatform.availableGamePlatform.metacritic.originalValue;
  }

  anyFieldsChanged(): boolean {
    return Object.keys(this.changedGameFields).length > 0 || Object.keys(this.changedPersonFields).length > 0;
  }

  onFinishedFieldEdit(event): void {
    this.finished = event;
    this.selectedPlatform.finished_date.value = !!this.finished ? new Date() : null;
    this.onFieldEdit();
  }

  onNaturalEndEdit(event): void {
    this.game.natural_end.value = event;
    this.onFieldEdit();
  }

  onFieldEdit(): void {
    this.changedGameFields = this.game.getChangedFields();
    this.changedPersonFields = this.selectedPlatform.getChangedFields();
  }

  anyPlatformsAreFinished(): boolean {
    const finishedPlatform = _.find(this.game.myPlatformsInGlobal, myPlatform => this.isFinished(myPlatform));
    return !!finishedPlatform;
  }

  isFinished(myPlatform: MyGamePlatform): boolean {
    return !!myPlatform.finished_date.value;
  }

  hasSelectedPlatform(): boolean {
    return !!this.selectedPlatform;
  }

  async openAddPlatformsPopup(): Promise<void> {
    const modalRef = this.modalService.open(AddPlatformsComponent, {size: 'md'});
    modalRef.componentInstance.game = this.game;
    const resultPlatform = await modalRef.result;
    if (!!resultPlatform) {
      this.selectedPlatform = resultPlatform;
    }
  }

  async changeValues(): Promise<void> {
    const allUpdates = [];

    if (Object.getOwnPropertyNames(this.changedPersonFields).length > 0) {
      allUpdates.push(this.doPersonUpdate());
    }

    if (Object.getOwnPropertyNames(this.changedGameFields).length > 0) {
      allUpdates.push(this.doGameUpdate());
    }

    await Promise.all(allUpdates);
    this.activeModal.close('Update Click');
  }

  dismiss(): void {
    this.game.discardChanges();
    this.activeModal.dismiss('Cross Click');
  }

  async doPersonUpdate(): Promise<void> {
    await this.gameService.updateMyPlatform(this.selectedPlatform);
  }

  async doGameUpdate(): Promise<void> {
    await this.gameService.updateGame(this.game);
  }

  // PLAYTIME

  showPlaytimeButton(): boolean {
    return this.selectedPlatform.canAddPlaytime();
  }

  async openPlaytimePopup(): Promise<void> {
    const modalRef = this.modalService.open(PlaytimePopupComponent, {size: 'lg'});
    modalRef.componentInstance.game = this.game;
    const resultSession = await modalRef.result;
    this.gameplaySessions.push(resultSession);
    this.sortSessions();
    this.initializeDates(this.selectedPlatform);
  }

  initializeDates(selectedPlatform: MyGamePlatform): void {
    this.original = new GameTime();
    this.timeTotal = new GameTime();
    this.original.initialize(selectedPlatform.minutes_played.value);
    this.timeTotal.initialize(this.game.minutesToFinish);
  }

}
