import { Component, OnInit } from '@angular/core';
import {Game} from '../../interfaces/Game';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'mm-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  games: Game[];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.refreshCache().subscribe(games => {
      this.games = games;
    });
  }

}
