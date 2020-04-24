import { Component, OnInit } from '@angular/core';
import {GameService} from '../../services/game.service';
import {Game} from '../../interfaces/Model/Game';
import * as _ from 'underscore';

@Component({
  selector: 'mm-duplicate-resolution',
  templateUrl: './duplicate-resolution.component.html',
  styleUrls: ['./duplicate-resolution.component.scss']
})
export class DuplicateResolutionComponent implements OnInit {

  games: Game[];
  gameGroups: GameGroup[];

  constructor(private gameService: GameService) {
    this.gameService.games.subscribe(incomingGames => {
      this.games = incomingGames;
      this.splitGamesIntoGroups();
    });
  }

  ngOnInit(): void {
  }

  splitGamesIntoGroups(): void {
    this.gameGroups = [];

    _.forEach(this.games, game => {
      const alreadyInGameGroup = _.findWhere(this.gameGroups, {igdb_id: game.igdb_id.value});

      if (!alreadyInGameGroup) {
        const matching = _.filter(this.games, otherGame => otherGame.igdb_id.value === game.igdb_id.value && otherGame.id.value !== game.id.value);
        if (matching.length > 0) {
          matching.push(game);
          const gameGroup = new GameGroup(matching);
          this.gameGroups.push(gameGroup);
        }
      }
    });
  }
}

class GameGroup {
  igdb_id: number;

  constructor(private games: Game[]) {
    this.igdb_id = games[0].igdb_id.value;
  }

  getTitles(): string[] {
    const titles = _.map(this.games, game => game.title.value);
    return _.uniq(titles);
  }

  getFirstPoster(): string[] {
    const posters = _.map(this.games, game => 'https://images.igdb.com/igdb/image/upload/t_720p/' + game.igdb_poster.value +  '.jpg');
    const compacted = _.compact(posters);
    return compacted.length > 0 ? compacted[0] : null;
  }

}
