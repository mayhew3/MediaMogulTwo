import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Model/Game';
import {ModalDismissReasons, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {PlaytimePopupComponent} from '../playtime-popup/playtime-popup.component';
import {GameDetailComponent} from '../game-detail/game-detail.component';
import {GameListComponent} from '../game-list/game-list.component';
import {AvailableGamePlatform} from '../../interfaces/Model/AvailableGamePlatform';
import {AddPlatformsComponent} from '../add-platforms/add-platforms.component';

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

  private static getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  constructor(private modalService: NgbModal) { }



  isNotRecentlyUnowned(): boolean {
    return !this.game.isOwned() || this.successfullyAdded;
  }

  hasSingleAvailablePlatform(): boolean {
    return this.game.addablePlatforms.length === 1;
  }

  getSingleAvailablePlatform(): AvailableGamePlatform {
    if (!this.hasSingleAvailablePlatform()) {
      throw new Error('Can only get single platform but there are ' + this.game.addablePlatforms.length + ' platforms.');
    }
    return this.game.addablePlatforms[0];
  }

  showProgressBar(): boolean {
    return this.game.isOwned() && this.game.natural_end.originalValue && this.game.getProgressPercent() !== undefined;
  }

  showAddGameButton(): boolean {
    return this.isNotRecentlyUnowned() && this.hasSingleAvailablePlatform();
  }

  showChoosePlatformsButton(): boolean {
    return this.isNotRecentlyUnowned() && !this.hasSingleAvailablePlatform();
  }

  showPlaytimeButton(): boolean {
    return this.game.canAddPlaytime() && this.game.isOwned() && !this.successfullyAdded;
  }

  async handlePopupResult(modalRef: NgbModalRef) {
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

  async openPlaytimePopup() {
    const modalRef = this.modalService.open(PlaytimePopupComponent, {size: 'lg'});
    modalRef.componentInstance.game = this.game;
    await this.handlePopupResult(modalRef);
  }

  async openDetailPopup() {
    if (this.game.isOwned()) {
      const modalRef = this.modalService.open(GameDetailComponent, {size: 'lg'});
      modalRef.componentInstance.game = this.game;
      await this.handlePopupResult(modalRef);
    }
  }

  async openAddPlatformsPopup() {
    const modalRef = this.modalService.open(AddPlatformsComponent, {size: 'md'});
    modalRef.componentInstance.game = this.game;
    await this.handlePopupResult(modalRef);
  }

  isSteamGame(): boolean {
    return this.game.hasPlatform('Steam');
  }

}
