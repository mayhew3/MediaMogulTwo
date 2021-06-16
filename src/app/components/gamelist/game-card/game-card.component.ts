import {Component, Input} from '@angular/core';
import {Game} from '../../../interfaces/Model/Game';
import {ModalDismissReasons, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {PlaytimePopupComponent} from '../playtime-popup/playtime-popup.component';
import {GameDetailComponent} from '../game-detail/game-detail.component';
import {GameListComponent} from '../game-list/game-list.component';
import {AvailableGamePlatform} from '../../../interfaces/Model/AvailableGamePlatform';
import {AddPlatformsComponent} from '../add-platforms/add-platforms.component';
import {PlatformService} from '../../../services/platform.service';
import {MyGamePlatform} from '../../../interfaces/Model/MyGamePlatform';
import {Observable} from 'rxjs';

@Component({
  selector: 'mm-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent {
  @Input() game: Game;
  @Input() parentList: GameListComponent;
  closeResult = '';
  successfullyAdded = false;

  constructor(private modalService: NgbModal,
              private platformService: PlatformService) { }

  private static getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  isNotRecentlyUnowned(): boolean {
    return !this.game.isOwned() || this.successfullyAdded;
  }

  hasSingleAvailablePlatform(): boolean {
    return this.addablePlatforms.length === 1;
  }

  getSingleAvailablePlatform(): AvailableGamePlatform {
    if (!this.hasSingleAvailablePlatform()) {
      throw new Error('Can only get single platform but there are ' + this.addablePlatforms.length + ' platforms.');
    }
    return this.addablePlatforms[0];
  }

  get addablePlatforms(): AvailableGamePlatform[] {
    return this.platformService.addablePlatforms(this.game);
  }

  get myMutablePlatforms(): MyGamePlatform[] {
    return this.platformService.myMutablePlatforms(this.game);
  }

  showProgressBar(): boolean {
    return this.game.isOwned() && this.game.data.natural_end && this.game.getProgressPercent() !== undefined;
  }

  showAddGameButton(): boolean {
    return this.isNotRecentlyUnowned() && this.hasSingleAvailablePlatform();
  }

  showChoosePlatformsButton(): boolean {
    return this.isNotRecentlyUnowned() && !this.hasSingleAvailablePlatform();
  }

  get myPreferredPlatform(): Observable<MyGamePlatform> {
    return this.platformService.getMyPreferredPlatform(this.game);
  }

  isOwned(): boolean {
    return this.game.isOwned();
  }

  canAddPlaytime(): boolean {
    return this.myMutablePlatforms.length > 0;
  }

  showPlaytimeButton(): boolean {
    return this.canAddPlaytime() && this.game.isOwned() && !this.successfullyAdded;
  }

  async handlePopupResult(modalRef: NgbModalRef): Promise<void> {
    try {
      const result = await modalRef.result;
      this.closeResult = `Closed with: ${result}`;
      if (!!this.parentList) {
        this.parentList.sortAndFilterGames();
      }
    } catch (err) {
      this.closeResult = `Dismissed ${GameCardComponent.getDismissReason(err)}`;
    }
  }

  async openPlaytimePopup(): Promise<void> {
    const modalRef = this.modalService.open(PlaytimePopupComponent, {size: 'lg'});
    modalRef.componentInstance.game = this.game;
    await this.handlePopupResult(modalRef);
  }

  async openDetailPopup(): Promise<void> {
    if (this.game.isOwned()) {
      const modalRef = this.modalService.open(GameDetailComponent, {size: 'lg'});
      modalRef.componentInstance.game_id = this.game.id;
      await this.handlePopupResult(modalRef);
    }
  }

  async openAddPlatformsPopup(): Promise<void> {
    const modalRef = this.modalService.open(AddPlatformsComponent, {size: 'md'});
    modalRef.componentInstance.game_id = this.game.id;
    await this.handlePopupResult(modalRef);
  }

  isSteamGame(): boolean {
    return this.game.hasPlatform('Steam');
  }

}
