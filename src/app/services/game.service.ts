import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  gamesUrl = 'api/games';
  cache: Game[];

  constructor(private http: HttpClient,
              private arrayService: ArrayService) {
    this.cache = [];
  }

  refreshCache(): Promise<Game[]> {
    return new Promise<Game[]>(resolve => {
      this.arrayService.emptyArray(this.cache);
      this.http.get<any[]>(this.gamesUrl).toPromise()
        .then((gameObjs) => {
          const games = this.convertObjectsToGames(gameObjs);
          this.arrayService.refreshArray(this.cache, games);
          resolve(games);
        });
    });
  }

  convertObjectsToGames(gameObjs: any[]): Game[] {
    const games = [];
    for (const gameObj of gameObjs) {
      const game = new Game(gameObj);
      games.push(game);
    }
    return games;
  }

  updateGame(gameID: number, changedFields): Promise<any> {
    return new Promise<any>(resolve => {
      const payload = {gameID, changedFields};
      this.http.patch(this.gamesUrl, payload, httpOptions).toPromise()
        .then(() => {
          resolve();
        });
    });
  }
}
