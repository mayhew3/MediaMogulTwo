import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Game';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PlaytimePopupComponent} from '../playtime-popup/playtime-popup.component';

@Component({
  selector: 'mm-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent implements OnInit {
  @Input() game: Game;
  closeResult = '';

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

  ngOnInit(): void {
  }

  getImageUrl(): string {
    if (!!this.game.igdb_poster && this.game.igdb_poster !== '') {
      return 'https://images.igdb.com/igdb/image/upload/t_720p/' + this.game.igdb_poster +  '.jpg';
    } else if (!!this.game.logo && this.game.logo !== '') {
      return 'https://cdn.edgecast.steamstatic.com/steam/apps/' + this.game.steamid + '/header.jpg';
    } else if (!!this.game.giantbomb_medium_url && this.game.giantbomb_medium_url !== '') {
      return this.game.giantbomb_medium_url;
    } else {
      return 'images/GenericSeries.gif';
    }
  }

  async open(game: Game) {
    const modalRef = this.modalService.open(PlaytimePopupComponent, {size: 'xl'});
    modalRef.componentInstance.game = game;
    try {
      const result = await modalRef.result;
      this.closeResult = `Closed with: ${result}`;
    } catch (err) {
      this.closeResult = `Dismissed ${GameCardComponent.getDismissReason(err)}`;
    }
  }

}
