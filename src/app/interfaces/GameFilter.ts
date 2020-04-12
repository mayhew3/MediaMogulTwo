import {Game} from './Game';

export abstract class GameFilter {
  abstract apply(game: Game): boolean;

  applyToList(games: Game[]): Game[] {
    const resultGames = [];
    for (const gameObj of games) {
      if (this.apply(gameObj)) {
        resultGames.push(gameObj);
      }
    }
    return resultGames;
  }
}

