import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Game';

@Component({
  selector: 'mm-playtime-popup',
  templateUrl: './playtime-popup.component.html',
  styleUrls: ['./playtime-popup.component.scss']
})
export class PlaytimePopupComponent {
  @Input() game: Game;

  constructor(public activeModal: NgbActiveModal) { }

}
