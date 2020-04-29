import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Model/Game';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';

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

  platformIsSelected(platform: MyGamePlatform): boolean {
    return platform.id.originalValue === this.selectedPlatform.id.originalValue;
  }

  selectPlatform(platform: MyGamePlatform): void {
    this.selectedPlatform = platform;
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
    const finishedPlatform = _.find(this.game.myPlatforms, myPlatform => this.isFinished(myPlatform));
    return !!finishedPlatform;
  }

  isFinished(myPlatform: MyGamePlatform): boolean {
    return !!myPlatform.finished_date.value;
  }

  hasPerson(): boolean {
    return !!this.selectedPlatform;
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
