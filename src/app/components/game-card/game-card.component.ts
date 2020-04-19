import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Model/Game';
import {ModalDismissReasons, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {PlaytimePopupComponent} from '../playtime-popup/playtime-popup.component';
import {GameDetailComponent} from '../game-detail/game-detail.component';
import {GameListComponent} from '../game-list/game-list.component';
import {Platform} from '../../interfaces/Enum/Platform';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'mm-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent implements OnInit {
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
  constructor(private modalService: NgbModal,
              private gameService: GameService) { }

  ngOnInit(): void {
  }

  getImageUrl(): string {
    if (!!this.game.igdb_poster.value && this.game.igdb_poster.value !== '') {
      return 'https://images.igdb.com/igdb/image/upload/t_720p/' + this.game.igdb_poster.value +  '.jpg';
    } else if (!!this.game.logo.value && this.game.logo.value !== '') {
      return 'https://cdn.edgecast.steamstatic.com/steam/apps/' + this.game.steamid.value + '/header.jpg';
    } else if (!!this.game.giantbomb_medium_url.value && this.game.giantbomb_medium_url.value !== '') {
      return this.game.giantbomb_medium_url.value;
    } else {
      return 'images/GenericSeries.gif';
    }
  }

  async handlePopupResult(modalRef: NgbModalRef) {
    try {
      const result = await modalRef.result;
      this.closeResult = `Closed with: ${result}`;
      if (!!this.parentList) {
        await this.parentList.fastSortGames();
      }
    } catch (err) {
      this.closeResult = `Dismissed ${GameCardComponent.getDismissReason(err)}`;
    }
  }

  getMyRatingOrMetacritic(): number {
    const myRating = this.game.personGame.rating.originalValue;
    return !!myRating ? myRating : this.game.metacritic.originalValue;
  }

  async openPlaytimePopup() {
    const modalRef = this.modalService.open(PlaytimePopupComponent, {size: 'lg'});
    modalRef.componentInstance.game = this.game;
    this.handlePopupResult(modalRef);
  }

  async openDetailPopup() {
    const modalRef = this.modalService.open(GameDetailComponent, {size: 'lg'});
    modalRef.componentInstance.game = this.game;
    this.handlePopupResult(modalRef);
  }

  isSteamGame(): boolean {
    return Platform.Steam === this.game.platform.value;
  }

  async addToMyGames(): Promise<any> {
    await this.gameService.addToMyGames(this.game);
    this.successfullyAdded = true;
  }
}
