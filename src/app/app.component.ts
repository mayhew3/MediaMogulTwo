import {Component, OnInit} from '@angular/core';
import {GameService} from './services/game.service';
import {Game} from './interfaces/Game';
import {ArrayService} from './services/array.service';

@Component({
  selector: 'mm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'media-mogul-two';
  games: Game[];

  constructor(private gameService: GameService,
              private arrayService: ArrayService) {
    this.games = [];
  }

  ngOnInit(): void {
    this.gameService.refreshCache().then(games => {
      this.arrayService.refreshArray(this.games, games);
    });
  }

  showGameList(): boolean {
    return !!this.games && this.games.length > 0;
  }
}
