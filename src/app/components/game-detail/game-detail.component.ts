import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Model/Game';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {AvailableGamePlatform} from '../../interfaces/Model/AvailableGamePlatform';
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

  allPlatforms: GamePlatform[] = [];

  constructor(private gameService: GameService,
              public activeModal: NgbActiveModal,
              public personService: PersonService,
              private platformService: PlatformService) {
    this.platformService.platforms.subscribe(platforms => ArrayUtil.refreshArray(this.allPlatforms, platforms));
    this.platformService.maybeRefreshCache();
  }

  ngOnInit(): void {
    this.finished = !!this.game.personGame && !!this.game.personGame.finished_date.value;
    this.editedTitle = this.game.title.value;
  }

  toggleTitleEdit() {
    this.titleEditMode = !this.titleEditMode;
  }

  anyFieldsChanged(): boolean {
    return Object.keys(this.changedGameFields).length > 0 || Object.keys(this.changedPersonFields).length > 0;
  }

  onFinishedFieldEdit() {
    this.game.personGame.finished_date.value = !!this.finished ? new Date() : undefined;
    this.onFieldEdit();
  }

  onFieldEdit() {
    this.changedGameFields = this.game.getChangedFields();
    this.changedPersonFields = this.game.personGame.getChangedFields();
  }

  isOwned(platform: GamePlatform): boolean {
    return this.game.personGame.hasPlatformWithIGDBID(platform.igdb_platform_id.value);
  }

  anyPlatformsAreFinished(): boolean {
    const finishedPlatform = _.find(this.game.personGame.myPlatforms, myPlatform => this.isFinished(myPlatform));
    return !!finishedPlatform;
  }

  isFinished(myPlatform: MyGamePlatform): boolean {
    return !!myPlatform.finished_date.value;
  }

  getMyPlatform(availableGamePlatform: AvailableGamePlatform): MyGamePlatform {
    return !this.game.personGame ? null : _.find(this.game.personGame.myPlatforms, myPlatform => myPlatform.platform.id.value === availableGamePlatform.platform.id.value);
  }

  getOwnedString(platform: GamePlatform): string {
    return this.isOwned(platform) ? 'Owned' : 'Unowned';
  }

  hasPerson(): boolean {
    return !!this.game.personGame;
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
    await this.gameService.updatePersonGame(this.game.personGame);
  }

  async doGameUpdate() {
    await this.gameService.updateGame(this.game);
  }

  async updateTitle() {
    await this.gameService.updateGame(this.game);
    this.titleEditMode = false;
  }
}
