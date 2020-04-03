import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';

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

  async refreshCache(): Promise<Game[]> {
    const gameObjs = await this.http.get<any[]>(this.gamesUrl).toPromise();
    const games = this.convertObjectsToGames(gameObjs);
    this.arrayService.refreshArray(this.cache, games);
    return this.cache;
  }

  convertObjectsToGames(gameObjs: any[]): Game[] {
    return _.map(gameObjs, gameObj => new Game(gameObj));
  }

  async updateGame(gameID: number, changedFields): Promise<any> {
    const payload = {gameID, changedFields};
    await this.http.patch(this.gamesUrl, payload, httpOptions).toPromise();
  }
}
