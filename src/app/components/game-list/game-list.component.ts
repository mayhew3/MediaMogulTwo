import {Component, Input} from '@angular/core';
import {Game} from '../../interfaces/Game';

@Component({
  selector: 'mm-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent {
  @Input() games: Game[];
  @Input() pageSize: number;
  page = 1;

  constructor() { }
}
