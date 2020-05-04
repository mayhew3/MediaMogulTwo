import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Model/Game';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';
import {AddPlatformsComponent} from '../add-platforms/add-platforms.component';

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

  debug = false;

  constructor(private gameService: GameService,
              private modalService: NgbModal,
              public activeModal: NgbActiveModal,
              public personService: PersonService,
              private platformService: PlatformService) {
    this.platformService.platforms.subscribe(platforms => ArrayUtil.refreshArray(this.allPlatforms, platforms));
    this.platformService.maybeRefreshCache();
  }

  ngOnInit(): void {
    this.selectedPlatform = this.game.myPreferredPlatform;
    this.finished = !!this.selectedPlatform && !!this.selectedPlatform.finished_date.value;
    this.editedTitle = this.game.title.value;
  }

  toggleTitleEdit() {
    this.titleEditMode = !this.titleEditMode;
  }

  hasMultiplePlatforms() {
    return this.game.myPlatformsInGlobal.length > 1;
  }

  selectedIsPreferred() {
    return this.selectedPlatform.id.originalValue === this.game.myPreferredPlatform.id.originalValue;
  }

  async changePreferredPlatform() {
    this.game.myPreferredPlatform.preferred.value = false;
    await this.gameService.updateMyPlatform(this.game.myPreferredPlatform);

    this.selectedPlatform.preferred.value = true;
    await this.gameService.updateMyPlatform(this.selectedPlatform);
  }

  platformIsSelected(platform: MyGamePlatform): boolean {
    return platform.id.originalValue === this.selectedPlatform.id.originalValue;
  }

  platformsExceptSelected(): MyGamePlatform[] {
    return _.without(this.game.myPlatformsInGlobal, this.selectedPlatform);
  }

  selectPlatform(platform: MyGamePlatform): void {
    this.selectedPlatform = platform;
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

  onFinishedFieldEdit(event) {
    this.finished = event;
    this.selectedPlatform.finished_date.value = !!this.finished ? new Date() : null;
    this.onFieldEdit();
  }

  onNaturalEndEdit(event) {
    this.game.natural_end.value = event;
    this.onFieldEdit();
  }

  onFieldEdit() {
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

  async openAddPlatformsPopup() {
    const modalRef = this.modalService.open(AddPlatformsComponent, {size: 'md'});
    modalRef.componentInstance.game = this.game;
    const resultPlatform = await modalRef.result;
    if (!!resultPlatform) {
      this.selectedPlatform = resultPlatform;
    }
  }

  async changeValues() {
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

  dismiss() {
    this.game.discardChanges();
    this.activeModal.dismiss('Cross Click');
  }

  async doPersonUpdate() {
    await this.gameService.updateMyPlatform(this.selectedPlatform);
  }

  async doGameUpdate() {
    await this.gameService.updateGame(this.game);
  }

}
