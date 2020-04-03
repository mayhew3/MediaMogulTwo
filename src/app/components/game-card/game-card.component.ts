import {Component, Input, OnInit} from '@angular/core';
import {Game} from '../../interfaces/Game';

@Component({
  selector: 'mm-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent implements OnInit {
  @Input() game: Game;

  constructor() { }

  ngOnInit(): void {
  }

  getImageUrl(): string {
    if (!!this.game.igdbPoster && this.game.igdbPoster !== '') {
      return 'https://images.igdb.com/igdb/image/upload/t_720p/' + this.game.igdbPoster +  '.jpg';
    } else if (!!this.game.logo && this.game.logo !== '') {
      return 'https://cdn.edgecast.steamstatic.com/steam/apps/' + this.game.steamID + '/header.jpg';
    } else if (!!this.game.giantBombMedium && this.game.giantBombMedium !== '') {
      return this.game.giantBombMedium;
    } else {
      return 'images/GenericSeries.gif';
    }
  }
}
